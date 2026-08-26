// extension/extension.ts

import { getPreviewUrlForUnit, disposeAllViteServers, runApp } from './ViteServerManager';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DelphineTreeProvider } from './delphine/DelphineTreeProvider';
import { newForm } from './delphine/NewForm';
import { DelphineCustomEditorProvider } from './editor/DelphineCustomEditorProvider';
import { newDelphineProject } from './delphine/NewDelphineProject';
import { newApp } from './delphine/NewApp';
import { normalizeToFileUri, resolveApp } from './projectModel';
import { resolveUnit } from './projectModel';
import { loadDoc } from './loadForm';
import { parseDformSource } from './dformSource'; // ou le bon chemin chez vous
import { loadDelphineFrame } from './loadDelphineFrame';
import { loadAppConfig } from './projectModel';
import { extractDelphineSection, extractLitTemplateSection } from './delphineSections';

let activeRuntimePreviewUri: vscode.Uri | undefined;

function findVisibleEditor(uri: vscode.Uri): vscode.TextEditor | undefined {
        return vscode.window.visibleTextEditors.find((editor) => editor.document.uri.toString() === uri.toString());
}

async function showTypescriptDocument(uri: vscode.Uri): Promise<vscode.TextEditor> {
        const existing = findVisibleEditor(uri);

        if (existing) {
                await vscode.window.showTextDocument(existing.document, {
                        viewColumn: existing.viewColumn,
                        preserveFocus: false,
                        preview: false
                });

                return existing;
        }

        const doc = await vscode.workspace.openTextDocument(uri);

        return vscode.window.showTextDocument(doc, {
                viewColumn: vscode.ViewColumn.Beside,
                preserveFocus: false,
                preview: false
        });
}

async function createRuntimePreviewPanel(context: vscode.ExtensionContext, url: string, sourceUri: vscode.Uri): Promise<void> {
        console.log('[Delphine] createRuntimePreviewPanel called', url, sourceUri.toString());
        activeRuntimePreviewUri = sourceUri;

        const panel = vscode.window.createWebviewPanel('delphineRuntimePreview', 'Delphine Runtime Preview', vscode.ViewColumn.Beside, {
                enableScripts: true
        });

        let refreshTimer: NodeJS.Timeout | undefined;

        function buildWebviewHtml(currentUrl: string): string {
                return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<meta http-equiv="Content-Security-Policy"
content="default-src 'none';
         frame-src http://localhost:* http://127.0.0.1:*;
         style-src 'unsafe-inline';
         script-src 'unsafe-inline';">

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
<iframe id="runtime-preview-frame" src="${currentUrl}"></iframe>

<script>

(function () {

        window.addEventListener('message', (event) => {

                const msg = event.data;

                if (!msg) {

                        return;

                }

                const frame = document.getElementById('runtime-preview-frame');

                if (!(frame instanceof HTMLIFrameElement) || !frame.contentWindow) {

                        return;

                }

                if (msg.type === 'runtimePreview:doc:update') {

                        frame.contentWindow.postMessage(

                                {

                                        type: 'doc:update',

                                        html: msg.html,

                                        css: msg.css

                                },

                                '*'

                        );

                }

        });

})();

</script>
</body>
</html>`;
        }

        panel.webview.html = buildWebviewHtml(url);

        const docChangeDisposable = vscode.workspace.onDidChangeTextDocument((ev) => {
                console.log('[Delphine] onDidChangeTextDocument (extension.ts)', ev.document.uri.toString());

                if (ev.document.uri.toString() !== sourceUri.toString()) {
                        return;
                }

                if (refreshTimer) {
                        clearTimeout(refreshTimer);
                }

                refreshTimer = setTimeout(() => {
                        refreshTimer = undefined;

                        console.log('[Delphine] runtime preview refresh for', sourceUri.toString());

                        const fullText = ev.document.getText();
                        const parts = parseDformSource(fullText);

                        panel.webview.postMessage({
                                type: 'runtimePreview:doc:update',
                                html: parts.template ?? '',
                                css: parts.style ?? ''
                        });
                }, 250);
        });

        panel.onDidDispose(() => {
                activeRuntimePreviewUri = undefined;

                if (refreshTimer) {
                        clearTimeout(refreshTimer);
                        refreshTimer = undefined;
                }

                saveDisposable.dispose();
                docChangeDisposable.dispose();
        });

        const saveDisposable = vscode.workspace.onDidSaveTextDocument(async (doc) => {
                if (doc.uri.toString() !== sourceUri.toString()) {
                        return;
                }

                console.log('[Delphine] runtime preview refresh on save for', sourceUri.toString());

                const loaded = await loadDoc(sourceUri);

                panel.webview.postMessage({
                        type: 'runtimePreview:doc:update',
                        html: loaded?.template ?? '',
                        css: loaded?.style ?? ''
                });
        });
}

function createNonce(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789';

        let result = '';

        for (let index = 0; index < 32; index++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return result;
}

function createDesignerHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
        const bootEditorUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'webview', 'bootEditor.bundle.js'));

        const designerRuntimePath = vscode.Uri.joinPath(extensionUri, 'media', 'webview', 'designerRuntime.bundle.js').fsPath;

        const designerRuntimeSource = fs.readFileSync(designerRuntimePath, 'utf8');

        const grapesJsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'grapes.min.js'));

        const grapesCssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'grapes.min.css'));

        const nonce = createNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="UTF-8">

<meta
        http-equiv="Content-Security-Policy"
        content="
                default-src 'none';

                style-src
                        ${webview.cspSource}
                        'unsafe-inline';

                script-src
                        ${webview.cspSource}
                        'nonce-${nonce}'
                        blob:
                        http://127.0.0.1:*;

                connect-src
                        http://127.0.0.1:*
                        ws://127.0.0.1:*;

                img-src
                        ${webview.cspSource}
                        data:;
        "
>
        <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
        >

        <link rel="stylesheet" href="${grapesCssUri}">

        <style>
                html,
                body {
                        height: 100%;
                        margin: 0;
                }

                #gjs {
                        height: 100%;
                }
        </style>
</head>

<body>
        <div id="gjs"></div>

        <script nonce="${nonce}" src="${grapesJsUri}"></script>

        <script nonce="${nonce}">
                window.__delphineDesignerRuntimeSource =
                        ${JSON.stringify(designerRuntimeSource)};
        </script>

        <script
                nonce="${nonce}"
                type="module"
                src="${bootEditorUri}">
        </script>
</body>
</html>`;
}

async function openDesigner(context: vscode.ExtensionContext, sourceUri: vscode.Uri): Promise<void> {
        const sourceDocument = await vscode.workspace.openTextDocument(sourceUri);
        const app = resolveApp(sourceUri);

        if (!app) {
                throw new Error(`Unable to resolve the Delphine app for "${sourceUri.fsPath}".`);
        }

        const appConfig = await loadAppConfig(app.rootDir);

        const baseTitle = `Delphine Designer — ${path.basename(sourceUri.fsPath)}`;

        const panel = vscode.window.createWebviewPanel('delphineDesigner', baseTitle, vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
        });

        function updateDesignerTitle(): void {
                panel.title = sourceDocument.isDirty ? `${baseTitle} *` : baseTitle;
        }

        panel.webview.onDidReceiveMessage(
                async (message: unknown) => {
                        if (typeof message !== 'object' || message === null || !('type' in message)) {
                                return;
                        }

                        const payload = message as { type: string };

                        console.log('[Delphine Designer host]', payload);
                        console.log(
                                '========== DELPHINE MESSAGE ==========',

                                payload.type,

                                payload
                        );
                        switch (payload.type) {
                                case 'bootEditor:ready':
                                        console.log('[Delphine] Designer WebView ready');
                                        break;

                                case 'app:get-config': {
                                        const previewUrl = await getPreviewUrlForUnit(sourceUri);

                                        const viteOrigin = new URL(previewUrl).origin;
                                        // extension.ts

                                        const designerConfig = {
                                                ...appConfig,

                                                frames: (appConfig.frames ?? []).map((frame) => ({
                                                        ...frame,

                                                        url: new URL(frame.url.replace(/^\.\//, ''), viteOrigin + '/').href
                                                }))
                                        };

                                        console.log('[Delphine Designer] config frames =', designerConfig.frames);

                                        await panel.webview.postMessage({
                                                type: 'app:config',
                                                config: designerConfig
                                        });

                                        break;
                                }

                                case 'log':
                                        console.log('[Delphine WebView]', message);
                                        break;

                                case 'delphine:get-theme': {
                                        console.log('[Delphine host] delphine:get-theme received');

                                        const themeName = appConfig.ui?.theme ?? 'flat'; // const themeName = 'motif';

                                        const themePath = vscode.Uri.joinPath(app.rootDir, 'public', 'themes', `${themeName}.css`);
                                        console.log('[Delphine host] loading theme:', themePath.fsPath);

                                        try {
                                                const bytes = await vscode.workspace.fs.readFile(themePath);

                                                const themeCss = Buffer.from(bytes).toString('utf8');

                                                console.log('[Delphine host] theme loaded:', themeName, themeCss.length);

                                                await panel.webview.postMessage({
                                                        type: 'delphine:theme',
                                                        theme: themeName,
                                                        themeCss
                                                });

                                                console.log('[Delphine host] delphine:theme sent');
                                        } catch (error) {
                                                console.error('[Delphine host] unable to load theme', themePath.fsPath, error);
                                        }

                                        break;
                                }
                                case 'delphine:design-ready': {
                                        try {
                                                console.log('[DESIGN READY] source =', sourceUri.fsPath);
                                                const frame = await loadDelphineFrame(sourceUri);
                                                console.log('[DESIGN READY] frameName =', frame.frameName);

                                                console.log('[DESIGN READY] layoutHtml =', frame.layoutHtml);

                                                console.log('[DESIGN READY] frameProperties =', frame.frameProperties);

                                                await panel.webview.postMessage({
                                                        type: 'html:update',
                                                        frameName: frame.frameName,
                                                        html: frame.layoutHtml,
                                                        css: '',
                                                        frameProperties: frame.frameProperties
                                                });
                                                console.log('[DESIGN READY] html:update SENT');
                                        } catch (error: unknown) {
                                                console.error('[DESIGN READY] FAILED', error);
                                                const message = error instanceof Error ? error.message : String(error);

                                                console.error('[Delphine] Failed to load frame layout.', error);

                                                void vscode.window.showErrorMessage(`Unable to load Delphine layout: ${message}`);
                                        }

                                        break;
                                }
                                case 'contentChanged': {
                                        const change = message as {
                                                type: 'contentChanged';
                                                html: string;
                                                css: string;
                                                rev: number;
                                        };

                                        try {
                                                await applyDesignerChanges(sourceDocument, change.html, change.css);

                                                updateDesignerTitle();
                                        } catch (error) {
                                                console.error('[Delphine] Unable to apply designer changes.', error);

                                                void vscode.window.showErrorMessage(`Unable to apply Designer changes: ${error instanceof Error ? error.message : String(error)}`);
                                        }

                                        break;
                                }

                                case 'delphine:save': {
                                        const saved = await sourceDocument.save();

                                        if (!saved) {
                                                void vscode.window.showErrorMessage('Unable to save Delphine frame.');
                                        }

                                        updateDesignerTitle();
                                        break;
                                }
                        }
                },
                undefined,
                context.subscriptions
        );

        panel.webview.html = createDesignerHtml(panel.webview, context.extensionUri);
}

async function applyDesignerChanges(document: vscode.TextDocument, html: string, _css: string): Promise<void> {
        const source = document.getText();

        const layoutSection = extractDelphineSection(source, 'layout');

        if (!layoutSection) {
                throw new Error('Delphine layout section not found.');
        }

        const template = extractLitTemplateSection(layoutSection.content);

        /*
         * template.contentStart / contentEnd are relative
         * to layoutSection.content.
         */
        const absoluteStart = layoutSection.contentStart + template.contentStart;

        const absoluteEnd = layoutSection.contentStart + template.contentEnd;

        const start = document.positionAt(absoluteStart);
        const end = document.positionAt(absoluteEnd);

        const replacement = `
${html}
        `;

        const edit = new vscode.WorkspaceEdit();

        edit.replace(document.uri, new vscode.Range(start, end), replacement);

        const applied = await vscode.workspace.applyEdit(edit);

        if (!applied) {
                throw new Error('Unable to apply Delphine Designer changes.');
        }

        console.log('[DIRTY TEST] applyEdit =', applied, 'isDirty =', document.isDirty);
}

function resolveCommandUri(input?: unknown): vscode.Uri | undefined {
        return (input as any)?.unit?.sourceUri ?? (input as any)?.fileUri ?? resolveUnit(normalizeToFileUri(input))?.sourceUri ?? normalizeToFileUri(input) ?? vscode.window.activeTextEditor?.document.uri;
}

function isDelphineFrameSource(uri: vscode.Uri): boolean {
        const document = vscode.workspace.textDocuments.find((doc) => doc.uri.toString() === uri.toString());

        if (!document) {
                return false;
        }

        const source = document.getText();

        return source.includes('// <delphine:layout>') && source.includes('// </delphine:layout>');
}

function resolveDesignerUri(input?: unknown): vscode.Uri | undefined {
        console.log('[RESOLVE DESIGNER] input =', input);

        /*
         * Command invoked from the Delphine tree.
         */
        const itemUri = (input as any)?.unit?.sourceUri ?? (input as any)?.fileUri;

        if (itemUri instanceof vscode.Uri) {
                console.log('[RESOLVE DESIGNER] tree uri =', itemUri.fsPath);
                return itemUri;
        }

        /*
         * Command invoked from the editor.
         *
         * A Delphine Frame is now a TypeScript source file, therefore
         * the active TypeScript document itself is the natural target.
         */
        const activeUri = vscode.window.activeTextEditor?.document.uri;

        console.log('[RESOLVE DESIGNER] activeUri =', activeUri?.fsPath);

        if (activeUri?.scheme === 'file' && activeUri.fsPath.endsWith('.ts')) {
                return activeUri;
        }

        /*
         * Last chance for older callers which pass a URI-like object.
         */
        const normalized = normalizeToFileUri(input);

        if (normalized?.fsPath.endsWith('.ts')) {
                return normalized;
        }

        return undefined;
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

                        await showTypescriptDocument(targetUri);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openDesigner', async (input?: unknown) => {
                        console.log('[OPEN DESIGNER] input =', input);

                        const targetUri = resolveDesignerUri(input);

                        console.log('[OPEN DESIGNER] target =', targetUri?.fsPath);

                        if (!targetUri) {
                                void vscode.window.showErrorMessage('No Delphine Frame selected');
                                return;
                        }

                        await openDesigner(context, targetUri);
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
