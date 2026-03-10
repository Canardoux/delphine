import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function newDelphineProject() {
        const name = await vscode.window.showInputBox({
                prompt: 'Project name'
        });

        if (!name) return;

        const folder = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                openLabel: 'Select location for project'
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

        fs.writeFileSync(path.join(mainForm, 'MainForm.html'), `<div data-delphine-form="MainForm">\n  Hello Delphine\n</div>\n`);

        fs.writeFileSync(path.join(mainForm, 'MainForm.ts'), `export class MainForm {\n  constructor() {\n    console.log("MainForm loaded");\n  }\n}\n`);

        fs.writeFileSync(path.join(mainForm, 'MainForm.css'), '');
        fs.writeFileSync(path.join(mainForm, 'MainForm.json'), '{}');

        vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath));
}
