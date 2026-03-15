import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FormsProvider } from './FormsProvider';
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

export async function newForm(formsProvider: FormsProvider) {
        const rawName = await vscode.window.showInputBox({
                prompt: 'Form name'
        });

        if (!rawName) return;

        const name = normalizeFormName(rawName);

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
}
