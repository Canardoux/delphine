import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FormsProvider } from './delphine/FormsProvider';
import { ProjectsProvider } from './delphine/ProjectsProvider';
import { newDelphineProject } from './delphine/NewDelphineProject';
import { newForm } from './delphine/NewForm';
import { PreviewPanel } from './preview/PreviewPanel';
import { DelphineCustomEditorProvider } from './editor/DelphineCustomEditorProvider';
import { spawn, ChildProcess } from 'child_process';
import { RuntimePreviewPanel } from './panels/RuntimePreviewPanel';

let viteProcess: ChildProcess | undefined;

function htmlToFormName(uri: vscode.Uri): string {
        return path.basename(uri.fsPath, '.html');
}

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

function buildPreviewUrl(formName: string): string {
        return `http://localhost:5173/src/preview.html?form=${encodeURIComponent(formName)}`;
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
         frame-src http://localhost:5173 http://127.0.0.1:5173;
         style-src 'unsafe-inline';">

<style>
html, body {
        margin:0;
        padding:0;
        width:100%;
        height:100%;
        overflow:hidden;
}

iframe {
        border:0;
        width:100%;
        height:100%;
}
</style>
</head>

<body>
<iframe src="${url}"></iframe>
</body>
</html>`;
}

async function ensureViteRunning(): Promise<void> {
        if (viteProcess && !viteProcess.killed) {
                return;
        }

        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) {
                throw new Error('No workspace open');
        }

        viteProcess = spawn('npm', ['run', 'dev'], {
                cwd: workspace.uri.fsPath,
                shell: true,
                stdio: 'pipe'
        });

        viteProcess.stdout?.on('data', (data: Buffer) => {
                console.log('[Delphine/Vite]', data.toString());
        });

        viteProcess.stderr?.on('data', (data: Buffer) => {
                console.error('[Delphine/Vite]', data.toString());
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));
}

async function runForm(uri?: vscode.Uri) {
        const htmlUri = resolveHtmlUri(uri);

        if (!htmlUri) {
                vscode.window.showErrorMessage('No form selected');
                return;
        }

        const formName = path.basename(htmlUri.fsPath, '.html');

        const workspace = vscode.workspace.workspaceFolders?.[0];

        if (!workspace) {
                vscode.window.showErrorMessage('No workspace');
                return;
        }

        // start vite if not running
        if (!viteProcess) {
                const cwd = workspace.uri.fsPath;

                viteProcess = spawn('npm', ['run', 'dev'], {
                        cwd,
                        shell: true
                });

                viteProcess.stdout?.on('data', (data: Buffer) => {
                        console.log(data.toString());
                });

                viteProcess.stderr?.on('data', (data: Buffer) => {
                        console.error(data.toString());
                });

                // small delay so vite can start
                await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        const url = `http://localhost:5174/?form=${formName}`;

        vscode.env.openExternal(vscode.Uri.parse(url));
}

/*
function resolveTargetUri(uri?: unknown): vscode.Uri | undefined {
        if (uri instanceof vscode.Uri && uri.scheme === 'file') {
                return uri;
        }

        const editorUri = vscode.window.activeTextEditor?.document.uri;
        if (editorUri && editorUri.scheme === 'file') {
                return editorUri;
        }

        return PreviewPanel.getActiveDocUri();
} */

/*
function resolveHtmlUri(uri?: unknown): vscode.Uri | undefined {
        if (uri instanceof vscode.Uri && uri.fsPath.endsWith('.html')) {
                return uri;
        }

        const active = vscode.window.activeTextEditor?.document.uri;
        if (active && active.fsPath.endsWith('.html')) {
                return active;
        }

        const previewUri = PreviewPanel.getActiveDocUri();
        if (previewUri && previewUri.fsPath.endsWith('.html')) {
                return previewUri;
        }

        return undefined;
}
        */

function htmlToTsUri(htmlUri: vscode.Uri): vscode.Uri {
        const dir = path.dirname(htmlUri.fsPath);
        const base = path.basename(htmlUri.fsPath, '.html');
        return vscode.Uri.file(path.join(dir, `${base}.ts`));
}

export function activate(context: vscode.ExtensionContext): void {
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
                vscode.commands.registerCommand('delphine.preview', async (uri?: vscode.Uri) => {
                        const htmlUri = resolveHtmlUri(uri);
                        if (!htmlUri) {
                                void vscode.window.showInformationMessage('No HTML form selected');
                                return;
                        }

                        const formName = htmlToFormName(htmlUri);
                        const url = buildPreviewUrl(formName);

                        createRuntimePreviewPanel(context, url);
                })
        ); /*vscode.commands.registerCommand('delphine.preview', async () => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                        void vscode.window.showInformationMessage('No active editor');
                        return;
                }
                await PreviewPanel.createOrShow(context, editor.document.uri);
        });*/

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
        /*
                vscode.commands.registerCommand(
                        
                        'delphine.newForm', async () => {
                        newForm();
                        formsProvider.refresh();

                        //await vscode.window.showTextDocument(vscode.Uri.file(path.join(formDir, `${name}.html`)));
                })
        );
*/
        /*
                vscode.commands.registerCommand('delphine.newForm', async () => {
                        const name = await vscode.window.showInputBox({
                                prompt: 'Form name'
                        });
                        if (!name) return;

                        const workspace = vscode.workspace.workspaceFolders?.[0];
                        if (!workspace) {
                                void vscode.window.showInformationMessage('No workspace open');
                                return;
                        }

                        const formsDir = path.join(workspace.uri.fsPath, 'src', 'forms');
                        const formDir = path.join(formsDir, name + '.form');

                        fs.mkdirSync(formDir, { recursive: true });

                        fs.writeFileSync(
                                path.join(formDir, `${name}.html`),
                                `<div data-delphine-form="${name}">
</div>
`
                        );

                        fs.writeFileSync(
                                path.join(formDir, `${name}.ts`),
                                `export class ${name} {

}
`
                        );

                        fs.writeFileSync(path.join(formDir, `${name}.css`), '');
                        fs.writeFileSync(path.join(formDir, `${name}.json`), '{}');

                        formsProvider.refresh();

                        await vscode.window.showTextDocument(vscode.Uri.file(path.join(formDir, `${name}.html`)));
                })
        );
        */

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.runForm', async (uri?: vscode.Uri) => {
                        await runForm(uri);
                })
        );

        /*
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.previewInBrowser', async (uri?: vscode.Uri) => {
                        const htmlUri = resolveHtmlUri(uri);
                        if (!htmlUri) {
                                void vscode.window.showInformationMessage('No HTML form selected');
                                return;
                        }

                        const tsUri = htmlToTsUri(htmlUri);

                        await ensureViteRunning();

                        const workspace = vscode.workspace.workspaceFolders?.[0];
                        if (!workspace) {
                                void vscode.window.showInformationMessage('No workspace open');
                                return;
                        }

                        const relativeTsPath = '/' + path.relative(workspace.uri.fsPath, tsUri.fsPath).replace(/\\/g, '/');
                        const url = `http://localhost:5174/preview.html?form=${encodeURIComponent(relativeTsPath)}`;

                        await vscode.env.openExternal(vscode.Uri.parse(url));
                })
        );
        */

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.previewBrowser', async (uri?: vscode.Uri) => {
                        const htmlUri = resolveHtmlUri(uri);
                        if (!htmlUri) {
                                void vscode.window.showInformationMessage('No HTML form selected');
                                return;
                        }

                        const formName = htmlToFormName(htmlUri);
                        const url = buildPreviewUrl(formName);

                        await vscode.env.openExternal(vscode.Uri.parse(url));
                })
        );
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.previewRuntime', async (uri?: vscode.Uri) => {
                        const htmlUri = resolveHtmlUri(uri);
                        if (!htmlUri) {
                                void vscode.window.showInformationMessage('No HTML form selected');
                                return;
                        }

                        const formName = htmlToFormName(htmlUri);
                        const url = buildPreviewUrl(formName);

                        createRuntimePreviewPanel(context, url);
                })
        );

        context.subscriptions.push(DelphineCustomEditorProvider.register(context));

        //context.subscriptions.push(vscode.window.registerTreeDataProvider('delphine.projects', projectsProvider));
        //context.subscriptions.push(vscode.commands.registerCommand('delphine.newProject', newDelphineProject));

        //context.subscriptions.push(vscode.commands.registerCommand('delphine.newForm', newForm));

        //context.subscriptions.push(vscode.window.registerTreeDataProvider('delphine.forms', formsProvider));

        context.subscriptions.push(vscode.window.registerTreeDataProvider('delphine.projects', projectsProvider), vscode.window.registerTreeDataProvider('delphine.forms', formsProvider));
}

export function deactivate(): void {}
