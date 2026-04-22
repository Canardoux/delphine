import * as vscode from 'vscode';

export class RuntimePreviewPanel {
        private static currentPanel: RuntimePreviewPanel | undefined;

        private readonly panel: vscode.WebviewPanel;
        private readonly extensionUri: vscode.Uri;
        private previewUrl: string = '';
        private sourceUri?: vscode.Uri;
        private docChangeTimer?: NodeJS.Timeout;
        private changeSubscription?: vscode.Disposable;

        private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
                this.panel = panel;
                this.extensionUri = extensionUri;

                this.panel.onDidDispose(() => {
                        if (this.docChangeTimer) {
                                clearTimeout(this.docChangeTimer);
                                this.docChangeTimer = undefined;
                        }

                        this.changeSubscription?.dispose();
                        this.changeSubscription = undefined;

                        RuntimePreviewPanel.currentPanel = undefined;
                });
        }

        public static createOrShow(extensionUri: vscode.Uri, previewUrl: string, sourceUri: vscode.Uri): void {
                const column = vscode.ViewColumn.Beside;

                if (RuntimePreviewPanel.currentPanel) {
                        RuntimePreviewPanel.currentPanel.panel.reveal(column);
                        RuntimePreviewPanel.currentPanel.update(previewUrl, sourceUri);
                        return;
                }

                const panel = vscode.window.createWebviewPanel('delphineRuntimePreview', 'Delphine Runtime Preview', column, {
                        enableScripts: true
                });

                RuntimePreviewPanel.currentPanel = new RuntimePreviewPanel(panel, extensionUri);
                RuntimePreviewPanel.currentPanel.update(previewUrl, sourceUri);
        }

        private update(previewUrl: string, sourceUri: vscode.Uri): void {
                this.previewUrl = previewUrl;
                this.sourceUri = sourceUri;

                this.installDocumentWatcher();

                this.panel.title = 'Delphine Runtime Preview';
                this.panel.webview.html = this.getHtml(this.previewUrl);
        }

        private installDocumentWatcher(): void {
                this.changeSubscription?.dispose();

                this.changeSubscription = vscode.workspace.onDidChangeTextDocument((ev) => {
                        console.log('[Delphine] onDidChangeTextDocument (RuntimePreviewPanel.ts)', ev.document.uri.toString());
                        if (!this.sourceUri) {
                                return;
                        }

                        if (ev.document.uri.toString() !== this.sourceUri.toString()) {
                                return;
                        }

                        if (this.docChangeTimer) {
                                clearTimeout(this.docChangeTimer);
                        }

                        this.docChangeTimer = setTimeout(() => {
                                this.docChangeTimer = undefined;
                                this.refreshIframe();
                        }, 250);
                });
        }

        private refreshIframe(): void {
                const bust = `delphinePreviewTs=${Date.now()}`;
                const separator = this.previewUrl.includes('?') ? '&' : '?';
                const url = `${this.previewUrl}${separator}${bust}`;

                this.panel.webview.html = this.getHtml(url);
        }

        private getHtml(previewUrl: string): string {
                return `<!doctype html>
<html>
<head>
        <meta charset="utf-8" />
        <meta
                http-equiv="Content-Security-Policy"
                content="default-src 'none'; frame-src http://localhost:5173 http://127.0.0.1:5173; style-src 'unsafe-inline';"
        />
        <style>
                html, body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                }

                iframe {
                        border: 0;
                        width: 100%;
                        height: 100%;
                }
        </style>
</head>
<body>
        <iframe src="${previewUrl}"></iframe>
</body>
</html>`;
        }
}
