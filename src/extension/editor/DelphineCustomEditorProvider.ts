import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { loadDoc } from '../loadForm';
import { mergeFormSource, splitFormSource } from '../dformSource';

/****************************************************************************************************************** */
/**
 * Minimal custom editor provider.
 *
 * This is intentionally clean + boring:
 * - no preview logic here
 * - no reveal loops
 * - one update path
 */
export class DelphineCustomEditorProvider implements vscode.CustomTextEditorProvider {
        public static readonly viewType = 'delphine.customEditor';
        private static _context: vscode.ExtensionContext;
        private _panel: vscode.WebviewPanel | undefined;
        private _extensionUri: vscode.Uri | undefined;

        public static register(context: vscode.ExtensionContext): vscode.Disposable {
                DelphineCustomEditorProvider._context = context;
                console.log('*** Delphine: registering custom editor provider ***');
                const provider = new DelphineCustomEditorProvider(context);
                return vscode.window.registerCustomEditorProvider(DelphineCustomEditorProvider.viewType, provider, {
                        webviewOptions: {
                                retainContextWhenHidden: true
                        }
                });
        }
        private isApplyingFromWebview = false;

        constructor(private readonly context: vscode.ExtensionContext) {}
        /**
         * Apply a full-document replace coming from the webview.
         * Note: we must await applyEdit, otherwise isApplyingFromWebview is released too early.
         */
        private async updateTextDocument(
                document: vscode.TextDocument,
                html: string
                //css: string
        ): Promise<boolean> {
                console.log('[Delphine/ext] replacing full document with =');
                console.log(html);
                if (html === document.getText()) return false; // ✅ évite de salir le doc pour rien
                this.isApplyingFromWebview = true;

                try {
                        const edit = new vscode.WorkspaceEdit();
                        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));

                        edit.replace(document.uri, fullRange, html);

                        const ok = await vscode.workspace.applyEdit(edit);
                        return ok;
                } finally {
                        // Release on next tick to avoid races with onDidChangeTextDocument handlers
                        setTimeout(() => {
                                this.isApplyingFromWebview = false;
                        }, 0);
                }
        }

        async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken): Promise<void> {
                const panelId = Math.random().toString(36).slice(2, 8);
                console.log(`[Delphine/ext] resolveCustomTextEditor panel=${panelId} doc=${document.uri.fsPath}`);
                let lastRev = 0;
                webviewPanel.webview.onDidReceiveMessage(async (msg) => {
                        //const msg = await e;
                        console.log('[Delphine/ext] message reçu =', msg);
                        console.log(`[VSCode] ${msg.type} <- from bootEditor`);
                        switch (msg.type) {
                                case 'alert':
                                        vscode.window.showErrorMessage(msg.text);
                                        return;

                                case 'log':
                                        console.log(`[VSCode] ${msg.type} <- from bootEditor : '${msg.text}'`);
                                        return;

                                case 'contentChanged':
                                        if (msg.rev && msg.rev <= lastRev) return;
                                        lastRev = msg.rev ?? lastRev + 1;

                                        console.log('================ SAVED TEMPLATE BEGIN ================');
                                        console.log(msg.html);
                                        console.log('================ SAVED TEMPLATE END ==================');
                                        const existing = splitFormSource(document.getText());

                                        const parts = {
                                                metadataAttributes: existing.metadataAttributes ?? {},
                                                template: msg.html ?? '',
                                                style: msg.css ?? ''
                                        };
                                        const d = await mergeFormSource(parts);
                                        console.log('================ SAVED DFORM BEGIN ===================');
                                        console.log(d);
                                        console.log('================ SAVED DFORM END =====================');
                                        await this.updateTextDocument(document, d ?? '');

                                        //await this.updateTextDocument(document, msg.html ?? ''); // !!!! Pas coule !!!!
                                        return;

                                case 'bootEditor:ready':
                                        updateWebviewFromFile(document);
                                        return;
                        }
                });

                this._extensionUri = DelphineCustomEditorProvider._context.extensionUri;
                webviewPanel.webview.options = {
                        enableScripts: true,
                        localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
                };
                this._panel = webviewPanel;

                console.log(`[Delphine/ext] build HTML panel=${panelId}`);
                webviewPanel.webview.html = this.buildHtml(webviewPanel.webview, document);

                console.log('---------------------------- HTML ---------------------------------');
                console.log(webviewPanel.webview.html);
                console.log('-------------------------------------------------------------------');

                const updateWebviewFromDocument = async (doc: vscode.TextDocument) => {
                        console.log(`[Delphine/ext] post doc:update panel=${panelId}`);

                        const fullText = doc.getText();
                        console.log('[Delphine/ext] fullText =', fullText);
                        const d = splitFormSource(fullText);
                        void webviewPanel.webview.postMessage({
                                html: d.template,
                                type: 'doc:update',
                                css: d.style
                        });
                };

                const updateWebviewFromFile = async (doc: vscode.TextDocument) => {
                        console.log(`[Delphine/ext] post doc:update panel=${panelId}`);

                        const docParts = await loadDoc(doc.uri);
                        const bodyInnerHtml = docParts?.template;
                        const cssText = docParts?.style;

                        console.log('[Delphine/ext] bodyInnerHtml =', bodyInnerHtml);

                        void webviewPanel.webview.postMessage({
                                html: bodyInnerHtml,
                                type: 'doc:update',
                                css: cssText ?? ''
                        });
                };

                const changeSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
                        if (e.document.uri.toString() !== document.uri.toString()) {
                                return;
                        }

                        if (this.isApplyingFromWebview) {
                                return;
                        }

                        void updateWebviewFromDocument(e.document);
                });

                webviewPanel.onDidDispose(() => changeSubscription.dispose());

                // ******************************************************************* Functions *********************************************

                // Keep it small and deterministic
        }

        private buildHtml(webview: vscode.Webview, document: vscode.TextDocument): string {
                const nonce = crypto.randomBytes(16).toString('base64url');

                const grapesCssUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'grapes.min.css'));
                const grapesJsUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'grapes.min.js'));
                const bootUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'webview', 'bootEditor.js'));
                const bridgeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'webview', 'bootBridge.js'));

                const csp = [
                        `default-src 'none'`,
                        `img-src ${webview.cspSource} https: data:`,
                        `style-src ${webview.cspSource} 'unsafe-inline' https://cdnjs.cloudflare.com`,
                        `font-src ${webview.cspSource} https: data:`,
                        `connect-src ${webview.cspSource} https:`,
                        `script-src ${webview.cspSource} https: 'unsafe-inline'`
                ].join('; ');

                return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />

<meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${grapesCssUri}">
  <style>
    html, body { height: 100%; margin: 0; overflow: hidden; }
    #gjs { height: 100vh; }
  </style>
</head>
<body>
  <div id="gjs"></div>

  <script nonce="${nonce}" src="${bridgeUri}"></script>
  <script nonce="${nonce}" src="${grapesJsUri}"></script>

</body>
</html>`;
        }

        private async replaceDocument(document: vscode.TextDocument, text: string): Promise<void> {
                const edit = new vscode.WorkspaceEdit();
                const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
                edit.replace(document.uri, fullRange, text);
                await vscode.workspace.applyEdit(edit);
        }
}

function escapeHtml(s: string): string {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
