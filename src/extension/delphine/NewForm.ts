import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function newForm() {
        const name = await vscode.window.showInputBox({
                prompt: 'Form name'
        });

        if (!name) return;

        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) return;

        const formsDir = path.join(workspace.uri.fsPath, 'src/forms');
        const formDir = path.join(formsDir, name);

        fs.mkdirSync(formDir, { recursive: true });

        fs.writeFileSync(path.join(formDir, `${name}.html`), `<div data-delphine-form="${name}">\n</div>\n`);

        fs.writeFileSync(path.join(formDir, `${name}.ts`), `export class ${name} {\n}\n`);

        fs.writeFileSync(path.join(formDir, `${name}.css`), '');
        fs.writeFileSync(path.join(formDir, `${name}.json`), '{}');
}
