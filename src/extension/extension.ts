import { getPreviewUrlForForm, disposeAllViteServers, runAppFromTree } from './ViteServerManager';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FormsProvider } from './delphine/FormsProvider';
import { ProjectsProvider } from './delphine/ProjectsProvider';
import { newForm } from './delphine/NewForm';
import { DelphineCustomEditorProvider } from './editor/DelphineCustomEditorProvider';
import { newDelphineProject } from './delphine/NewDelphineProject';
import { newApp } from './delphine/NewApp';
import { normalizeToFileUri, resolveApp, resolveCssUri, resolveForm, resolveHtmlUri, resolveTsUri } from './projectModel';

function resolveCommandUri(input?: unknown): vscode.Uri | undefined {
        const explicit = normalizeToFileUri(input);
        if (explicit) {
                return explicit;
        }

        const activeEditorUri = vscode.window.activeTextEditor?.document.uri;
        if (activeEditorUri instanceof vscode.Uri) {
                return activeEditorUri;
        }

        return activeRuntimePreviewUri;
}

function resolveFormSiblingUri(input: unknown, ext: 'html' | 'ts' | 'css'): vscode.Uri | undefined {
        const uri = normalizeToFileUri(input) ?? vscode.window.activeTextEditor?.document.uri;
        if (!uri || uri.scheme !== 'file') {
                return undefined;
        }

        const fsPath = uri.fsPath;
        if (!fsPath) {
                return undefined;
        }

        const dir = fs.existsSync(fsPath) && fs.statSync(fsPath).isDirectory() ? fsPath : path.dirname(fsPath);

        const formDirName = path.basename(dir);

        if (!formDirName.endsWith('.form')) {
                if (fsPath.endsWith(`.${ext}`)) {
                        return uri;
                }
                return undefined;
        }

        const formName = formDirName.slice(0, -'.form'.length);
        return vscode.Uri.file(path.join(dir, `${formName}.${ext}`));
}

let activeRuntimePreviewUri: vscode.Uri | undefined;
function createRuntimePreviewPanel(context: vscode.ExtensionContext, url: string, sourceUri: vscode.Uri): void {
        activeRuntimePreviewUri = sourceUri;

        const panel = vscode.window.createWebviewPanel('delphineRuntimePreview', 'Delphine Runtime Preview', vscode.ViewColumn.Beside, {
                enableScripts: true
        });

        panel.onDidDispose(() => {
                activeRuntimePreviewUri = undefined;
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
                vscode.commands.registerCommand('delphine.openTypeScript', async (input?: unknown) => {
                        const tsUri = resolveTsUri(input);
                        if (!tsUri) {
                                void vscode.window.showInformationMessage('No TypeScript form selected');
                                return;
                        }

                        await vscode.window.showTextDocument(tsUri);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openHtmlSource', async (input?: unknown) => {
                        const htmlUri = resolveHtmlUri(input);
                        if (!htmlUri) {
                                void vscode.window.showInformationMessage('No HTML form selected');
                                return;
                        }

                        await vscode.window.showTextDocument(htmlUri);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openCssSource', async (input?: unknown) => {
                        const cssUri = resolveCssUri(input);
                        if (!cssUri) {
                                void vscode.window.showInformationMessage('No CSS form selected');
                                return;
                        }

                        await vscode.window.showTextDocument(cssUri);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openEditor', async (input?: unknown) => {
                        const htmlUri = resolveHtmlUri(input);
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
                        await newDelphineProject(context);
                })
        );

        // ------------------------------------------------
        // New Form
        // ------------------------------------------------
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.newForm', async (uri?: vscode.Uri) => {
                        await newForm(uri);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.preview', async (input?: unknown) => {
                        try {
                                const targetUri = resolveCommandUri(input);
                                const url = await getPreviewUrlForForm(targetUri);
                                createRuntimePreviewPanel(context, url, normalizeToFileUri(input) ?? targetUri!);
                        } catch (e) {
                                console.error(e);
                                void vscode.window.showErrorMessage(String(e));
                        }
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.previewBrowser', async (uri?: unknown) => {
                        try {
                                const targetUri = resolveCommandUri(uri);
                                const url = await getPreviewUrlForForm(targetUri);

                                await vscode.env.openExternal(vscode.Uri.parse(url));
                        } catch (e) {
                                console.error(e);
                                void vscode.window.showErrorMessage(String(e));
                        }
                })
        );
        context.subscriptions.push(DelphineCustomEditorProvider.register(context));

        context.subscriptions.push(vscode.window.registerTreeDataProvider('delphine.projects', projectsProvider), vscode.window.registerTreeDataProvider('delphine.forms', formsProvider));

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.newApp', async () => {
                        await newApp();
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.runApp', async (input?: unknown) => {
                        await runAppFromTree(input);
                })
        );
}

export function deactivate(): void {
        disposeAllViteServers();
}
