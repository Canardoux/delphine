//import * as crypto from 'crypto';
//import * as fs from 'node:fs';

import * as vscode from 'vscode';
import * as path from 'path';

export type ResolvedForm = {
        name: string;
        formDir: vscode.Uri;
        htmlUri: vscode.Uri;
        cssUri: vscode.Uri;
        tsUri: vscode.Uri;
        jsonUri: vscode.Uri;
};
/*
export async function loadFormText(uri: vscode.Uri | undefined, ext: string): Promise<string> {
        const targetUri = resolveFormSiblingUri(uri, ext);

        if (!targetUri) {
                throw new Error(`Unable to resolve .${ext} file for Form`);
        }

        const data = await vscode.workspace.fs.readFile(targetUri);
        return Buffer.from(data).toString('utf8');
}

export function resolveFormSiblingUri(uri: vscode.Uri | undefined, ext: string): vscode.Uri | undefined {
        if (!uri) {
                return undefined;
        }

        const fsPath = uri.fsPath;

        const dir = path.dirname(fsPath);
        const formDir = path.basename(dir);

        if (!formDir.endsWith('.form')) {
                return undefined;
        }

        const formName = formDir.slice(0, -'.form'.length);

        const siblingPath = path.join(dir, `${formName}.${ext}`);

        return vscode.Uri.file(siblingPath);
}

export async function loadFormHtml(uri?: vscode.Uri): Promise<string> {
        return loadFormText(uri, 'html');
}

export async function loadFormCss(uri?: vscode.Uri): Promise<string> {
        return loadFormText(uri, 'css');
}

export async function loadFormTs(uri?: vscode.Uri): Promise<string> {
        return loadFormText(uri, 'ts');
}
*/

export function resolveForm(uri: vscode.Uri | undefined): ResolvedForm | undefined {
        if (!uri) {
                return undefined;
        }

        let fsPath = uri.fsPath;
        let dir = path.dirname(fsPath);
        let base = path.basename(fsPath);
        let formDirName = path.basename(dir);

        // Case 1: uri points directly to the .form directory
        if (fsPath.endsWith('.form')) {
                const name = path.basename(fsPath, '.form');
                return {
                        name,
                        formDir: uri,
                        htmlUri: vscode.Uri.file(path.join(fsPath, `${name}.html`)),
                        cssUri: vscode.Uri.file(path.join(fsPath, `${name}.css`)),
                        tsUri: vscode.Uri.file(path.join(fsPath, `${name}.ts`)),
                        jsonUri: vscode.Uri.file(path.join(fsPath, `${name}.json`))
                };
        }

        // Case 2: uri points to a file inside *.form
        if (!formDirName.endsWith('.form')) {
                return undefined;
        }

        const name = formDirName.slice(0, -'.form'.length);
        const formDirPath = dir;

        return {
                name,
                formDir: vscode.Uri.file(formDirPath),
                htmlUri: vscode.Uri.file(path.join(formDirPath, `${name}.html`)),
                cssUri: vscode.Uri.file(path.join(formDirPath, `${name}.css`)),
                tsUri: vscode.Uri.file(path.join(formDirPath, `${name}.ts`)),
                jsonUri: vscode.Uri.file(path.join(formDirPath, `${name}.json`))
        };
}

export async function readTextFile(uri: vscode.Uri): Promise<string> {
        const data = await vscode.workspace.fs.readFile(uri);
        return Buffer.from(data).toString('utf8');
}

export async function loadFormHtml(uri?: vscode.Uri): Promise<string> {
        const form = resolveForm(uri);
        if (!form) {
                throw new Error('Unable to resolve Form HTML');
        }

        return readTextFile(form.htmlUri);
}

export async function loadFormCss(uri?: vscode.Uri): Promise<string> {
        const form = resolveForm(uri);
        if (!form) {
                throw new Error('Unable to resolve Form CSS');
        }

        return readTextFile(form.cssUri);
}

export async function loadFormTs(uri?: vscode.Uri): Promise<string> {
        const form = resolveForm(uri);
        if (!form) {
                throw new Error('Unable to resolve Form TypeScript');
        }

        return readTextFile(form.tsUri);
}
