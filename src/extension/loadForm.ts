import * as vscode from 'vscode';
import { resolveDformUri } from './projectModel.js';
import { parseDformSource, extractDformTemplate, extractDformStyle, type DformParts } from './dformSource.js';

export async function readTextFile(uri: vscode.Uri): Promise<string> {
        const data = await vscode.workspace.fs.readFile(uri);
        return Buffer.from(data).toString('utf8');
}

export async function loadFormSource(uri: vscode.Uri): Promise<string> {
        const dformUri = resolveDformUri(uri) ?? uri;
        return await readTextFile(dformUri);
}

export async function loadDoc(uri: vscode.Uri): Promise<DformParts> {
        const txt = await loadFormSource(uri);
        return parseDformSource(txt);
}

export async function loadFormHtml(uri: vscode.Uri): Promise<string> {
        const source = await loadFormSource(uri);
        return extractDformTemplate(source);
}

export async function loadFormCss(uri: vscode.Uri): Promise<string> {
        const source = await loadFormSource(uri);
        return extractDformStyle(source);
}
