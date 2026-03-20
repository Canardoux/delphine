import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function ucfirst(name: string): string {
        if (!name) {
                return name;
        }

        return name[0].toUpperCase() + name.slice(1);
}

/**
 * Create a new App inside the current workspace.
 */
export async function newApp(): Promise<void> {
        const workspace = vscode.workspace.workspaceFolders?.[0];

        if (!workspace) {
                vscode.window.showErrorMessage('No workspace open');
                return;
        }

        const rawName = await vscode.window.showInputBox({
                prompt: 'App name',
                placeHolder: 'MyApp',
                ignoreFocusOut: true,
                validateInput: (value) => {
                        const trimmed = value.trim();

                        if (!trimmed) {
                                return 'App name is required';
                        }

                        if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
                                return 'Use only letters, digits, dash and underscore';
                        }

                        return null;
                }
        });

        if (!rawName) {
                return;
        }

        const appName = ucfirst(rawName?.trim());

        const appsDir = path.join(workspace.uri.fsPath, 'src', 'apps');
        const appDir = path.join(appsDir, appName);

        if (fs.existsSync(appDir)) {
                vscode.window.showErrorMessage(`App already exists: ${appName}`);
                return;
        }

        // --------------------------------------------------
        // Create directories
        // --------------------------------------------------
        const formsDir = path.join(appDir, 'forms');
        const mainFormDir = path.join(formsDir, 'MainForm.form');

        fs.mkdirSync(mainFormDir, { recursive: true });

        // --------------------------------------------------
        // app.json
        // --------------------------------------------------
        fs.writeFileSync(
                path.join(appDir, 'app.json'),
                JSON.stringify(
                        {
                                mainForm: 'MainForm'
                        },
                        null,
                        2
                ) + '\n'
        );

        // --------------------------------------------------
        // MainForm.html
        // --------------------------------------------------
        fs.writeFileSync(
                path.join(mainFormDir, 'MainForm.html'),
                `<div>
    Hello from ${appName}
</div>
`
        );

        // --------------------------------------------------
        // MainForm.ts
        // --------------------------------------------------
        fs.writeFileSync(
                path.join(mainFormDir, 'MainForm.ts'),
                `import { TForm } from '@vcl/Form';

export class MainForm extends TForm {
}
`
        );

        // --------------------------------------------------
        // MainForm.css
        // --------------------------------------------------
        fs.writeFileSync(path.join(mainFormDir, 'MainForm.css'), '');

        // --------------------------------------------------
        // Refresh explorer
        // --------------------------------------------------
        vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');

        vscode.window.showInformationMessage(`App '${appName}' created`);
}
