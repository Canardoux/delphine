import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FormsProvider } from './delphine/FormsProvider';
import { ProjectsProvider } from './delphine/ProjectsProvider';
import { newDelphineProject } from './delphine/NewDelphineProject';
import { newForm } from './delphine/NewForm';
import { PreviewPanel } from './preview/PreviewPanel';
import { DelphineCustomEditorProvider } from './editor/DelphineCustomEditorProvider';

function resolveTargetUri(uri?: unknown): vscode.Uri | undefined {
        if (uri instanceof vscode.Uri && uri.scheme === 'file') {
                return uri;
        }

        const editorUri = vscode.window.activeTextEditor?.document.uri;
        if (editorUri && editorUri.scheme === 'file') {
                return editorUri;
        }

        return PreviewPanel.getActiveDocUri();
}

export function activate(context: vscode.ExtensionContext): void {
        const formsProvider = new FormsProvider();

        // Register the Forms TreeView
        context.subscriptions.push(vscode.window.registerTreeDataProvider('delphine.forms', formsProvider));

        // -------------------------------------------------
        // Commands
        // ------------------------------------------------

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.preview', async (uri?: unknown) => {
                        const targetUri = resolveTargetUri(uri);
                        if (!targetUri) {
                                void vscode.window.showInformationMessage('No target document');
                                return;
                        }

                        await PreviewPanel.createOrShow(context, targetUri);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openEditor', async (uri?: unknown) => {
                        const targetUri = resolveTargetUri(uri);
                        if (!targetUri) {
                                void vscode.window.showInformationMessage('No target document');
                                return;
                        }

                        await vscode.commands.executeCommand('vscode.openWith', targetUri, 'delphine.customEditor');
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openSource', async (uri?: unknown) => {
                        const targetUri = resolveTargetUri(uri);
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

                        // Create delphine.json
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

                        // Create initial form
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

                        // Open the project in VSCode
                        vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath));
                })
        );

        // ------------------------------------------------
        // New Form
        // ------------------------------------------------

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.newForm', async () => {
                        const name = await vscode.window.showInputBox({
                                prompt: 'Form name'
                        });

                        if (!name) return;

                        const workspace = vscode.workspace.workspaceFolders?.[0];
                        if (!workspace) {
                                vscode.window.showInformationMessage('No workspace open');
                                return;
                        }

                        const formsDir = path.join(workspace.uri.fsPath, 'src', 'forms');
                        const formDir = path.join(formsDir, name);

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

                        // Refresh the Forms view
                        formsProvider.refresh();

                        // Open the HTML file
                        const uri = vscode.Uri.file(path.join(formDir, `${name}.html`));

                        vscode.commands.executeCommand('vscode.open', uri);
                })
        );

        const projectsProvider = new ProjectsProvider();

        context.subscriptions.push(vscode.window.registerTreeDataProvider('delphine.projects', projectsProvider));
        context.subscriptions.push(DelphineCustomEditorProvider.register(context));
        context.subscriptions.push(vscode.commands.registerCommand('delphine.newProject', newDelphineProject));

        context.subscriptions.push(vscode.commands.registerCommand('delphine.newForm', newForm));

        context.subscriptions.push(vscode.window.registerTreeDataProvider('delphine.forms', formsProvider));
}

export function deactivate(): void {}
