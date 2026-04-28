import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { loadDoc } from '../loadForm';
import { mergeFormSource, splitFormSource } from '../dformSource';

// ****************************** Interface from Delphine Designer to the Code Editor *****************************************

/*
function buildHandlerName(model: any, eventName: string): string {
        const attrs = model.getAttributes?.() ?? {};
        const compName = attrs['data-delphine-name'] ?? 'component';

        return `${compName}_${eventName.toLowerCase()}`;
}

export function openOrCreateHandler(editor: any, model: any, eventName: string) {
        if (!model) return;

        const attrs = model.getAttributes?.() ?? {};
        const attrName = `data-delphine-${eventName}`;

        let handlerName = attrs[attrName];

        // 1️⃣ si pas défini → générer
        if (!handlerName || handlerName.trim() === '') {
                handlerName = buildHandlerName(model, eventName);

                model.setAttributes({
                        ...attrs,
                        [attrName]: handlerName
                });
        }

        // 2️⃣ récupérer le code actuel
        const code = getCurrentCode(); // ⚠️ à brancher chez vous

        // 3️⃣ chercher handler
        const pos = findHandlerPosition(code, handlerName);

        let newCode = code;
        let targetPos = pos;

        // 4️⃣ si absent → créer
        if (pos === null) {
                newCode = createHandler(code, handlerName);
                targetPos = newCode.length;
        }

        // 5️⃣ envoyer au code editor
        updateCode(newCode); // ⚠️ à brancher
        revealPosition(targetPos); // ⚠️ à brancher
}
        

function findHandlerPosition(code: string, handlerName: string): number | null {
        const regex = new RegExp(`function\\s+${handlerName}\\s*\\(`);
        const match = code.match(regex);

        return match ? (match.index ?? null) : null;
}


function createHandler(code: string, handlerName: string): string {
        return code + `\n\nexport function ${handlerName}(sender: TObject): void {\n` + `        // TODO: ${handlerName}\n` + `}\n`;
}
        */

function getCompanionTypescriptUri(dformUri: vscode.Uri): vscode.Uri {
        const fsPath = dformUri.fsPath;

        if (fsPath.endsWith('.dform')) {
                return vscode.Uri.file(fsPath.replace(/\.dform$/i, '.ts'));
        }

        return vscode.Uri.file(fsPath + '.ts');
}

function sanitizeIdentifier(value: string): string {
        return String(value ?? '')
                .trim()
                .replace(/[^a-zA-Z0-9_$]/g, '_')
                .replace(/^[^a-zA-Z_$]/, '_');
}

function findHandlerPosition(code: string, handlerName: string): number | null {
        const escaped = handlerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const patterns = [new RegExp(`export\\s+function\\s+${escaped}\\s*\\(`), new RegExp(`function\\s+${escaped}\\s*\\(`), new RegExp(`${escaped}\\s*\\(`)];

        for (const regex of patterns) {
                const match = regex.exec(code);
                if (match?.index !== undefined) {
                        return match.index;
                }
        }

        return null;
}

function getDelphineClassName(dformText: string): string | null {
        const match = dformText.match(/<delphine\b[^>]*\bclass=["']([^"']+)["']/i);
        return match?.[1] ?? null;
}

function findClassEndPosition(code: string, className: string): number | null {
        const classPos = code.indexOf(`class ${className}`);
        if (classPos < 0) return null;

        const openBrace = code.indexOf('{', classPos);
        if (openBrace < 0) return null;

        let depth = 0;

        for (let i = openBrace; i < code.length; i++) {
                const ch = code[i];

                if (ch === '{') depth++;
                if (ch === '}') depth--;

                if (depth === 0) {
                        return i;
                }
        }

        return null;
}

function findHandlerBodyPosition(code: string, handlerName: string): number | null {
        const fnPos = findHandlerPosition(code, handlerName);
        if (fnPos === null) return null;

        const bracePos = code.indexOf('{', fnPos);
        if (bracePos < 0) return fnPos;

        return bracePos + 1;
}

function createHandler(handlerName: string): string {
        return `\n\n        ${handlerName}(_ev: Event | null, _sender: TControl) {\n` + `                // TODO: handle ${handlerName}\n` + `        }\n`;
}

function createExportedHandler(handlerName: string): string {
        return `\n\nexport function ${handlerName}(_ev: Event | null, _sender: TControl): void {\n` + `        // TODO: handle ${handlerName}\n` + `}\n`;
}

async function handleOpenHandler(msg: any, dformDocument: vscode.TextDocument) {
        debugger;
        const tsUri = getCompanionTypescriptUri(dformDocument.uri);

        const tsDocument = await vscode.workspace.openTextDocument(tsUri);
        //const tsEditor = await vscode.window.showTextDocument(tsDocument, {
        //        preview: false,
        //        viewColumn: vscode.ViewColumn.Beside
        //});
        console.log('[Delphine] file opened =', tsDocument.uri.fsPath);

        const tsEditor = await vscode.window.showTextDocument(tsDocument, {
                preview: false,
                viewColumn: vscode.ViewColumn.Active, // 🔥 IMPORTANT
                preserveFocus: false // 🔥 DONNE LE FOCUS
        });

        const componentName = sanitizeIdentifier(msg.componentName ?? 'component');
        const eventName = sanitizeIdentifier(msg.eventName ?? 'onclick');

        const handlerName = sanitizeIdentifier(msg.handlerName ?? '') || `${componentName}_${eventName.toLowerCase()}`;

        let code = tsDocument.getText();
        let pos = findHandlerPosition(code, handlerName);

        if (pos === null) {
                const dformText = dformDocument.getText();
                const className = getDelphineClassName(dformText) ?? 'MainForm';

                const classEnd = findClassEndPosition(code, className);

                if (classEnd !== null) {
                        const insertion = createHandler(handlerName);

                        const insertPos = tsDocument.positionAt(classEnd);

                        await tsEditor.edit((edit) => {
                                edit.insert(insertPos, insertion);
                        });
                } else {
                        // fallback provisoire

                        const endPos = tsDocument.positionAt(code.length);

                        await tsEditor.edit((edit) => {
                                edit.insert(endPos, createExportedHandler(handlerName));
                        });
                }

                const insertion = createHandler(handlerName);

                code = tsDocument.getText();
                pos = findHandlerPosition(code, handlerName);
        }

        if (pos === null) {
                return;
        }
        const target = findHandlerBodyPosition(code, handlerName) ?? pos;

        const position = tsDocument.positionAt(target + 1);

        tsEditor.selection = new vscode.Selection(position, position);

        tsEditor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);

        //const position = tsDocument.positionAt(pos);
        //tsEditor.selection = new vscode.Selection(position, position);
        //tsEditor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        /*
        setTimeout(() => {
                const position = tsDocument.positionAt(pos);

                tsEditor.selection = new vscode.Selection(position, position);
                tsEditor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        }, 50);
        console.log('[Delphine] jumping to handler at pos=', pos);
        /*
        const tsEditor2 = await vscode.window.showTextDocument(tsDocument, {
                preview: false,
                viewColumn: vscode.ViewColumn.Active, // 🔥 IMPORTANT
                preserveFocus: false // 🔥 DONNE LE FOCUS
        });
        */
}

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
                if (html === document.getText()) {
                        console.log('[Delphine/ext] skipped applyEdit because document text is identical');
                        return false;
                } // ✅ évite de salir le doc pour rien
                this.isApplyingFromWebview = true;

                try {
                        const edit = new vscode.WorkspaceEdit();
                        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));

                        edit.replace(document.uri, fullRange, html);

                        const ok = await vscode.workspace.applyEdit(edit);
                        console.log(`[Delphine/ext] applyEdit ok=${ok}`);
                        return ok;
                } finally {
                        // Release on next tick to avoid races with onDidChangeTextDocument handlers
                        setTimeout(() => {
                                this.isApplyingFromWebview = false;
                        }, 0);
                }
        }

        async revealComponentInDform(document: vscode.TextDocument, componentName: string) {
                if (!componentName) return;

                const editor = await vscode.window.showTextDocument(document, {
                        preview: false,
                        viewColumn: vscode.ViewColumn.Active,
                        preserveFocus: false
                });

                const text = document.getText();
                const pos = this.findComponentInDform(text, componentName);

                if (pos === null) return;

                const position = document.positionAt(pos);

                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        }

        findComponentInDform(text: string, componentName: string): number | null {
                const escaped = this.escapeRegExp(componentName);

                const regex = new RegExp(`data-delphine-name=["']${escaped}["']`, 'i');

                const match = regex.exec(text);
                return match?.index ?? null;
        }

        escapeRegExp(value: string): string {
                return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        findComponentNameAtPosition(text: string, offset: number): string | null {
                const before = text.slice(0, offset);

                // trouver le dernier "<"
                const tagStart = before.lastIndexOf('<');
                if (tagStart < 0) return null;

                const tagEnd = text.indexOf('>', tagStart);
                if (tagEnd < 0) return null;

                // vérifier qu'on est dans la balise
                if (offset > tagEnd) return null;

                const tagText = text.slice(tagStart, tagEnd + 1);

                if (!tagText.includes('data-delphine-component')) {
                        return null;
                }

                const match = tagText.match(/data-delphine-name=["']([^"']+)["']/i);
                return match?.[1] ?? null;
        }

        async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken): Promise<void> {
                const panelId = Math.random().toString(36).slice(2, 8);
                debugger;
                console.log(`[Delphine/ext] resolveCustomTextEditor panel=${panelId} doc=${document.uri.fsPath}`);
                let lastRev = 0;
                webviewPanel.webview.onDidReceiveMessage(async (msg) => {
                        debugger;
                        //const msg = await e;
                        console.log('[Delphine/ext] message reçu =', msg);
                        console.log(`[VSCode] ${msg.type} <- from bootEditor`);
                        switch (msg.type) {
                                case 'delphine:save':
                                        await document.save();

                                        return;

                                case 'delphine:preview':
                                        await vscode.commands.executeCommand('delphine.preview', document.uri);

                                        return;

                                case 'delphine:view-source':
                                        await vscode.commands.executeCommand('delphine.openSource', document.uri);

                                        return;

                                case 'alert':
                                        vscode.window.showErrorMessage(msg.text);
                                        return;

                                case 'log':
                                        console.log(`[VSCode] ${msg.type} <- from bootEditor : '${msg.text}'`);
                                        return;

                                case 'contentChanged':
                                        console.log(`[Delphine/ext] contentChanged received rev=${msg.rev} html.length=${(msg.html ?? '').length} css.length=${(msg.css ?? '').length}`);
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

                                case 'delphine:open-handler':
                                        await handleOpenHandler(msg, document);
                                        return;

                                case 'delphine:designer-selection-changed':
                                        await this.revealComponentInDform(document, msg.componentName);
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
                        console.log('[Delphine] onDidChangeTextDocument (DelphineCustomEditor.ts) ', e.document.uri.toString());
                        if (e.document.uri.toString() !== document.uri.toString()) {
                                return;
                        }

                        if (this.isApplyingFromWebview) {
                                return;
                        }

                        void updateWebviewFromDocument(e.document);
                });

                const selectionSubscription = vscode.window.onDidChangeTextEditorSelection((e) => {
                        if (e.textEditor.document.uri.toString() !== document.uri.toString()) {
                                return;
                        }

                        const offset = document.offsetAt(e.selections[0].active);

                        const componentName = this.findComponentNameAtPosition(document.getText(), offset);

                        if (!componentName) return;

                        webviewPanel.webview.postMessage({
                                type: 'delphine:select-component',
                                componentName
                        });
                });

                webviewPanel.onDidDispose(() => {
                        changeSubscription.dispose();
                        selectionSubscription.dispose();
                });

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
