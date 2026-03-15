// src/panels/RuntimePreviewPanel.ts

import * as vscode from 'vscode';

export class RuntimePreviewPanel {
        private static currentPanel: RuntimePreviewPanel | undefined;
        private readonly panel: vscode.WebviewPanel;
        private readonly extensionUri: vscode.Uri;

        private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
                this.panel = panel;
                this.extensionUri = extensionUri;

                this.panel.onDidDispose(() => {
                        RuntimePreviewPanel.currentPanel = undefined;
                });
        }

        public static createOrShow(extensionUri: vscode.Uri, previewUrl: string): void {
                const column = vscode.ViewColumn.Beside;

                if (RuntimePreviewPanel.currentPanel) {
                        RuntimePreviewPanel.currentPanel.panel.reveal(column);
                        RuntimePreviewPanel.currentPanel.update(previewUrl);
                        return;
                }

                const panel = vscode.window.createWebviewPanel(
                        'delphineRuntimePreview',
                        'Delphine Runtime Preview',
                        column,
                        {
                                enableScripts: true
                        }
                );

                RuntimePreviewPanel.currentPanel = new RuntimePreviewPanel(panel, extensionUri);
                RuntimePreviewPanel.currentPanel.update(previewUrl);
        }

        private update(previewUrl: string): void {
                this.panel.title = 'Delphine Runtime Preview';
                this.panel.webview.html = this.getHtml(previewUrl);
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
