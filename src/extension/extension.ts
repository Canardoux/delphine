import { getPreviewUrlForUnit, disposeAllViteServers, runApp } from './ViteServerManager';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
//import { ProjectsProvider } from './delphine/ProjectsProvider';
import { DelphineTreeProvider } from './delphine/DelphineTreeProvider';
import { newForm } from './delphine/NewForm';
import { DelphineCustomEditorProvider } from './editor/DelphineCustomEditorProvider';
import { newDelphineProject } from './delphine/NewDelphineProject';
import { newApp } from './delphine/NewApp';
import { normalizeToFileUri, resolveApp, resolveCssUri, resolveHtmlUri, resolveTsUri } from './projectModel';

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

function findAppRoot(startPath: string): string | undefined {
        let dir = fs.statSync(startPath).isDirectory() ? startPath : path.dirname(startPath);

        while (true) {
                if (fs.existsSync(path.join(dir, 'app.json'))) {
                        return dir;
                }

                const parent = path.dirname(dir);
                if (parent === dir) {
                        return undefined;
                }
                dir = parent;
        }
}

function resolveCompositePaths(item: any): { htmlPath?: string; tsPath?: string; cssPath?: string; appRoot?: string } | null {
        if (!item || !item.type || !item.fullPath) {
                return null;
        }

        if (item.type === 'form' || item.type === 'frame') {
                const baseName = item.label;
                return {
                        htmlPath: path.join(item.fullPath, `${baseName}.html`),
                        tsPath: path.join(item.fullPath, `${baseName}.ts`),
                        cssPath: path.join(item.fullPath, `${baseName}.css`),
                        appRoot: findAppRoot(item.fullPath)
                };
        }

        if (item.type === 'formFile' || item.type === 'frameFile') {
                const dir = path.dirname(item.fullPath);
                const ext = path.extname(item.fullPath);
                const baseName = path.basename(item.fullPath, ext);

                return {
                        htmlPath: path.join(dir, `${baseName}.html`),
                        tsPath: path.join(dir, `${baseName}.ts`),
                        cssPath: path.join(dir, `${baseName}.css`),
                        appRoot: findAppRoot(item.fullPath)
                };
        }

        return null;
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
        //const formsProvider = new FormsProvider();
        //const projectsProvider = new ProjectsProvider();
        //context.subscriptions.push(vscode.window.registerTreeDataProvider('delphine.projects', projectsProvider), vscode.window.registerTreeDataProvider('delphine.forms', formsProvider));
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

        const delphineProvider = new DelphineTreeProvider(workspaceRoot);
        vscode.window.registerTreeDataProvider('delphineTree', delphineProvider);

        // -------------------------------------------------
        // Commands
        // ------------------------------------------------
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.preview', async (item) => {
                        console.log('preview item =', item);

                        const resolved = resolveCompositePaths(item);
                        if (!resolved?.htmlPath) {
                                vscode.window.showErrorMessage('No HTML form/frame selected');
                                return;
                        }

                        const htmlUri = vscode.Uri.file(resolved.htmlPath);
                        const url = await getPreviewUrlForUnit(htmlUri);
                        createRuntimePreviewPanel(context, url, htmlUri);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.previewBrowser', async (item) => {
                        console.log('previewBrowser item =', item);

                        const resolved = resolveCompositePaths(item);
                        if (!resolved?.htmlPath) {
                                vscode.window.showErrorMessage('No HTML form/frame selected');
                                return;
                        }

                        const htmlUri = vscode.Uri.file(resolved.htmlPath);
                        const url = await getPreviewUrlForUnit(htmlUri);

                        await vscode.env.openExternal(vscode.Uri.parse(url));
                })
        );

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
                vscode.commands.registerCommand('delphine.openEditor', async (item) => {
                        console.log('openEditor item =', item);

                        const resolved = resolveCompositePaths(item);
                        if (!resolved?.htmlPath) {
                                vscode.window.showErrorMessage('No Delphine form/frame selected');
                                return;
                        }

                        await vscode.commands.executeCommand('vscode.openWith', vscode.Uri.file(resolved.htmlPath), 'delphine.customEditor');
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
                        delphineProvider.refresh();
                })
        );

        // ------------------------------------------------
        // New Form
        // ------------------------------------------------
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.newForm', async (input?: unknown) => {
                        await newForm(input);
                        delphineProvider.refresh();
                })
        );
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.runApp', async (item) => {
                        console.log('runApp item =', item);

                        let appRoot: string | undefined;

                        if (item?.type === 'app') {
                                appRoot = item.fullPath;
                        } else if (item?.fullPath) {
                                appRoot = findAppRoot(item.fullPath);
                        }

                        if (!appRoot) {
                                vscode.window.showErrorMessage('No Delphine app selected');
                                return;
                        }

                        await runApp(vscode.Uri.file(appRoot));
                })
        );
        context.subscriptions.push(DelphineCustomEditorProvider.register(context));

        //context.subscriptions.push(vscode.window.registerTreeDataProvider('delphine.projects', projectsProvider), vscode.window.registerTreeDataProvider('delphine.forms', formsProvider));
        //const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        //const delphineProvider = new DelphineTreeProvider(workspaceRoot);

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.newApp', async () => {
                        delphineProvider.refresh();
                        await newApp();
                })
        );
}

export function deactivate(): void {
        disposeAllViteServers();
}
