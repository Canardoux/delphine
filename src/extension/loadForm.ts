//import * as crypto from 'crypto';
//import * as fs from 'node:fs';

import * as vscode from 'vscode';
import * as path from 'path';
import { resolveUnit } from './projectModel';

export async function readTextFile(uri: vscode.Uri): Promise<string> {
        const data = await vscode.workspace.fs.readFile(uri);
        return Buffer.from(data).toString('utf8');
}

export async function loadFormHtml(uri?: vscode.Uri): Promise<string> {
        const form = resolveUnit(uri);
        if (!form) {
                throw new Error('Unable to resolve Form HTML');
        }

        return readTextFile(form.htmlUri);
}

export async function loadFormCss(uri?: vscode.Uri): Promise<string> {
        const form = resolveUnit(uri);
        if (!form) {
                throw new Error('Unable to resolve Form CSS');
        }

        return readTextFile(form.cssUri);
}

export async function loadFormTs(uri?: vscode.Uri): Promise<string> {
        const form = resolveUnit(uri);
        if (!form) {
                throw new Error('Unable to resolve Form TypeScript');
        }

        return readTextFile(form.tsUri);
}
