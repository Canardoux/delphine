import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FormsProvider } from './FormsProvider';
import { resolveApp } from '../projectModel';
/*
export async function newForm() {
        const name = await vscode.window.showInputBox({
                prompt: 'Form name'
        });

        if (!name) return;

        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) return;

        const formsDir = path.join(workspace.uri.fsPath, 'src/forms');
        debugger;
        const formDir = path.join(formsDir, `${name}.form`);
        console.log('[Delphine] creating form in', formDir);

        fs.mkdirSync(formDir, { recursive: true });

        fs.writeFileSync(path.join(formDir, `${name}.html`), `<div data-delphine-form="${name}">\n</div>\n`);

        fs.writeFileSync(path.join(formDir, `${name}.ts`), `export class ${name} {\n}\n`);

        fs.writeFileSync(path.join(formDir, `${name}.css`), '');
        fs.writeFileSync(path.join(formDir, `${name}.json`), '{}');
}
*/

function normalizeFormName(name: string): string {
        return name.charAt(0).toUpperCase() + name.slice(1);
}

function ucfirst(name: string): string {
        if (!name) {
                return name;
        }

        return name[0].toUpperCase() + name.slice(1);
}

function resolveAppDir(uri?: vscode.Uri): string | undefined {
        if (!uri) {
                return undefined;
        }

        const fsPath = uri.fsPath;

        let current = fs.statSync(fsPath).isDirectory() ? fsPath : path.dirname(fsPath);

        while (true) {
                const appJson = path.join(current, 'app.json');

                if (fs.existsSync(appJson)) {
                        return current;
                }

                const parent = path.dirname(current);
                if (parent === current) {
                        return undefined;
                }

                current = parent;
        }
}

export async function newForm(input?: unknown): Promise<void> {
        //const targetUri = uri ?? vscode.window.activeTextEditor?.document.uri;

        //const appDir = resolveAppDir(targetUri);
        const app = resolveApp(input);
        if (!app) return;

        //if (!appDir) {
        //vscode.window.showErrorMessage('No App found for this location');
        //return;
        //}

        const rawName = await vscode.window.showInputBox({
                prompt: 'Form name',
                placeHolder: 'Customer',
                ignoreFocusOut: true,
                validateInput: (value) => {
                        const trimmed = value.trim();

                        if (!trimmed) {
                                return 'Form name is required';
                        }

                        if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
                                return 'Use only letters, digits, underscore';
                        }

                        return null;
                }
        });

        if (!rawName) {
                return;
        }

        const formName = ucfirst(rawName.trim());

        //const formsDir = path.join(appDir, 'forms');
        const formDir = path.join(app.formsDir.fsPath, `${formName}.form`);

        if (fs.existsSync(formDir)) {
                vscode.window.showErrorMessage(`Form already exists: ${formName}`);
                return;
        }

        fs.mkdirSync(formDir, { recursive: true });

        // HTML
        fs.writeFileSync(
                path.join(formDir, `${formName}.html`),
                `<div>
    ${formName} works
</div>
`
        );

        // TS
        fs.writeFileSync(
                path.join(formDir, `${formName}.ts`),
                `import { TForm } from '@vcl/Form';

export class ${formName} extends TForm {
}
`
        );

        // CSS
        fs.writeFileSync(path.join(formDir, `${formName}.css`), '');

        vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');

        vscode.window.showInformationMessage(`Form '${formName}' created`);
}
