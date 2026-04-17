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
import { normalizeToFileUri, resolveApp } from './projectModel';
import { resolveUnit } from './projectModel';

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

export function activate(context: vscode.ExtensionContext): void {
        console.log('[Delphine] registering projects provider');
        const delphineProvider = new DelphineTreeProvider();
        vscode.window.registerTreeDataProvider('delphineTree', delphineProvider);

        // -------------------------------------------------
        // Commands
        // ------------------------------------------------
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.preview', async (item?: unknown) => {
                        const unit = (item as any)?.unit ?? resolveUnit(normalizeToFileUri(item));

                        if (!unit) {
                                void vscode.window.showErrorMessage('No Delphine form/frame selected');
                                return;
                        }

                        const url = await getPreviewUrlForUnit(unit.sourceUri);
                        createRuntimePreviewPanel(context, url, unit.sourceUri);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.previewBrowser', async (item?: unknown) => {
                        console.log('previewBrowser item =', item);

                        const unit = (item as any)?.unit ?? resolveUnit(normalizeToFileUri(item));

                        if (!unit) {
                                void vscode.window.showErrorMessage('No Delphine form/frame selected');
                                return;
                        }

                        const url = await getPreviewUrlForUnit(unit.sourceUri);
                        await vscode.env.openExternal(vscode.Uri.parse(url));
                })
        );
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openEditor', async (input?: unknown) => {
                        console.log('openEditor item =', input);

                        const targetUri = (input as any)?.unit?.sourceUri ?? resolveUnit(normalizeToFileUri(input))?.sourceUri ?? normalizeToFileUri(input);

                        if (!targetUri) {
                                void vscode.window.showErrorMessage('No Delphine form/frame selected');
                                return;
                        }

                        await vscode.commands.executeCommand('vscode.openWith', targetUri, 'delphine.customEditor');
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openSource', async (input?: unknown) => {
                        const targetUri = (input as any)?.fileUri ?? resolveUnit(normalizeToFileUri(input))?.sourceUri ?? normalizeToFileUri(input);

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
                vscode.commands.registerCommand('delphine.runApp', async (input?: unknown) => {
                        console.log('runApp item =', input);

                        const app = (input as any)?.project ?? resolveApp(normalizeToFileUri(input));

                        if (!app) {
                                void vscode.window.showErrorMessage('No Delphine app selected');
                                return;
                        }

                        await runApp(app.rootDir);
                })
        );
        context.subscriptions.push(DelphineCustomEditorProvider.register(context));

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
