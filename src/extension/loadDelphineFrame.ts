// extension/loadDelphineFrame.ts

import * as vscode from 'vscode';
import * as path from 'path';
import { extractDelphineSection, extractLitTemplateFromSection } from './delphineSections';

export interface LoadedDelphineFrame {
        frameName: string;
        source: string;
        layoutHtml: string;
}

export async function loadDelphineFrame(sourceUri: vscode.Uri): Promise<LoadedDelphineFrame> {
        const bytes = await vscode.workspace.fs.readFile(sourceUri);
        const source = Buffer.from(bytes).toString('utf8');

        const layoutSection = extractDelphineSection(source, 'layout');

        const layoutHtml = extractLitTemplateFromSection(layoutSection.content);

        return {
                frameName: path.basename(sourceUri.fsPath, path.extname(sourceUri.fsPath)),
                source,
                layoutHtml
        };
}
