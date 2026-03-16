import { getPreviewUrlForForm, previewOnViteInBrowser } from './ViteServerManager';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FormsProvider } from './delphine/FormsProvider';
import { ProjectsProvider } from './delphine/ProjectsProvider';
import { newForm } from './delphine/NewForm';
import { DelphineCustomEditorProvider } from './editor/DelphineCustomEditorProvider';

function resolveHtmlUri(uri?: unknown): vscode.Uri | undefined {
        if (uri instanceof vscode.Uri && uri.fsPath.endsWith('.html')) {
                return uri;
        }

        const active = vscode.window.activeTextEditor?.document.uri;
        if (active && active.fsPath.endsWith('.html')) {
                return active;
        }

        return undefined;
}

function createRuntimePreviewPanel(context: vscode.ExtensionContext, url: string): void {
        const panel = vscode.window.createWebviewPanel('delphineRuntimePreview', 'Delphine Runtime Preview', vscode.ViewColumn.Beside, {
                enableScripts: true
        });

        panel.webview.html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<meta http-equiv="Content-Security-Policy"
content="default-src 'none';
         frame-src http://localhost:* http://127.0.0.1:*;
         style-src 'unsafe-inline';">

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
<iframe src="${url}"></iframe>
</body>
</html>`;
}

function htmlToTsUri(htmlUri: vscode.Uri): vscode.Uri {
        const dir = path.dirname(htmlUri.fsPath);
        const base = path.basename(htmlUri.fsPath, '.html');
        return vscode.Uri.file(path.join(dir, `${base}.ts`));
}

export function activate(context: vscode.ExtensionContext): void {
        console.log('[Delphine] registering projects provider');
        const formsProvider = new FormsProvider();
        const projectsProvider = new ProjectsProvider();

        // Register the Forms TreeView
        //context.subscriptions.push(vscode.window.registerTreeDataProvider('delphine.forms', formsProvider));

        // -------------------------------------------------
        // Commands
        // ------------------------------------------------
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openTypeScript', async (uri?: vscode.Uri) => {
                        const htmlUri = resolveHtmlUri(uri);
                        if (!htmlUri) {
                                void vscode.window.showInformationMessage('No HTML form selected');
                                return;
                        }

                        const tsUri = htmlToTsUri(htmlUri);
                        await vscode.window.showTextDocument(tsUri);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openHtmlSource', async (uri?: vscode.Uri) => {
                        const targetUri = resolveHtmlUri(uri);
                        if (!targetUri) {
                                void vscode.window.showInformationMessage('No HTML form selected');
                                return;
                        }

                        await vscode.window.showTextDocument(targetUri);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openEditor', async (uri?: vscode.Uri) => {
                        const htmlUri = resolveHtmlUri(uri);
                        if (!htmlUri) {
                                void vscode.window.showInformationMessage('No HTML form selected');
                                return;
                        }

                        await vscode.commands.executeCommand('vscode.openWith', htmlUri, 'delphine.customEditor');
                })
        );
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openSource', async (uri?: unknown) => {
                        const targetUri = resolveHtmlUri(uri);
                        if (!targetUri) {
                                void vscode.window.showInformationMessage('No target document');
                                return;
                        }

                        await vscode.window.showTextDocument(targetUri, {
                                preview: false,
                                viewColumn: vscode.ViewColumn.One
                        });
                })
        );

        // ------------------------------------------------
        // New Delphine Project
        // ------------------------------------------------
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.newProject', async () => {
                        const name = await vscode.window.showInputBox({
                                prompt: 'Project name'
                        });
                        if (!name) return;

                        const folder = await vscode.window.showOpenDialog({
                                canSelectFolders: true,
                                openLabel: 'Select project location'
                        });
                        if (!folder) return;

                        const projectPath = path.join(folder[0].fsPath, name);
                        fs.mkdirSync(projectPath, { recursive: true });

                        const src = path.join(projectPath, 'src');
                        const forms = path.join(src, 'forms');
                        const mainForm = path.join(forms, 'MainForm');
                        fs.mkdirSync(mainForm, { recursive: true });

                        fs.writeFileSync(
                                path.join(projectPath, 'delphine.json'),
                                JSON.stringify(
                                        {
                                                name,
                                                formsDir: 'src/forms',
                                                mainForm: 'MainForm'
                                        },
                                        null,
                                        2
                                )
                        );

                        fs.writeFileSync(
                                path.join(mainForm, 'MainForm.html'),
                                `<div data-delphine-form="MainForm">
  Hello Delphine
</div>
`
                        );

                        fs.writeFileSync(
                                path.join(mainForm, 'MainForm.ts'),
                                `export class MainForm {
    constructor() {
        console.log("MainForm loaded");
    }
}
`
                        );

                        fs.writeFileSync(path.join(mainForm, 'MainForm.css'), '');
                        fs.writeFileSync(path.join(mainForm, 'MainForm.json'), '{}');

                        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath));
                })
        );
        // ------------------------------------------------
        // New Form
        // ------------------------------------------------
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.newForm', async () => {
                        newForm(formsProvider);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.preview', async (uri?: vscode.Uri) => {
                        try {
                                const url = await getPreviewUrlForForm(uri ?? vscode.window.activeTextEditor?.document.uri);
                                createRuntimePreviewPanel(context, url);
                        } catch (e) {
                                console.error(e);
                                void vscode.window.showErrorMessage(String(e));
                        }
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.previewBrowser', async (uri?: vscode.Uri) => {
                        try {
                                console.log('delphine.previewBrowser : uri.fsPath = ', uri?.fsPath);
                                await previewOnViteInBrowser(uri ?? vscode.window.activeTextEditor?.document.uri);
                        } catch (e) {
                                console.error(e);
                                void vscode.window.showErrorMessage(String(e));
                        }
                })
        );

        context.subscriptions.push(DelphineCustomEditorProvider.register(context));

        context.subscriptions.push(vscode.window.registerTreeDataProvider('delphine.projects', projectsProvider), vscode.window.registerTreeDataProvider('delphine.forms', formsProvider));
}

export function deactivate(): void {}
