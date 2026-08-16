// extension/loadDelphineFrame.ts

import * as vscode from 'vscode';
import * as path from 'path';
import { extractDelphineSection, extractLitTemplateFromSection } from './delphineSections';

export interface LoadedDelphineFrame {
        frameName: string;
        source: string;
        layoutHtml: string;
        frameProperties: Record<string, string | number | boolean>;
}

// export async function loadDelphineFrame(sourceUri: vscode.Uri): Promise<LoadedDelphineFrame> {
//         const bytes = await vscode.workspace.fs.readFile(sourceUri);
//         const source = Buffer.from(bytes).toString('utf8');

//         const layoutSection = extractDelphineSection(source, 'layout');

//         const layoutHtml = extractLitTemplateFromSection(layoutSection.content);
//         const framePropertiesSection = extractDelphineSection(source, 'property-values');

//         return {
//                 frameName: path.basename(sourceUri.fsPath, path.extname(sourceUri.fsPath)),
//                 source,
//                 layoutHtml,
//                 frameProperties: framePropertiesSection ? JSON.parse(framePropertiesSection.content) : {}
//         };
// }
function parseFramePropertyValues(source: string): Record<string, string | number | boolean> {
        const section = extractDelphineSection(source, 'property-values');

        const result: Record<string, string | number | boolean> = {};

        const assignmentRegex = /^\s*([A-Za-z_$][\w$]*)\s*=\s*(.*?)\s*;\s*$/gm;

        let match: RegExpExecArray | null;

        while ((match = assignmentRegex.exec(section.content)) !== null) {
                const name = match[1];
                const rawValue = match[2].trim();

                if ((rawValue.startsWith("'") && rawValue.endsWith("'")) || (rawValue.startsWith('"') && rawValue.endsWith('"'))) {
                        result[name] = rawValue.slice(1, -1);
                        continue;
                }

                if (rawValue === 'true') {
                        result[name] = true;
                        continue;
                }

                if (rawValue === 'false') {
                        result[name] = false;
                        continue;
                }

                const numberValue = Number(rawValue);

                if (Number.isFinite(numberValue)) {
                        result[name] = numberValue;
                        continue;
                }

                throw new Error(`Unsupported initial value for frame property "${name}": ${rawValue}`);
        }

        return result;
}

export async function loadDelphineFrame(sourceUri: vscode.Uri): Promise<LoadedDelphineFrame> {
        const bytes = await vscode.workspace.fs.readFile(sourceUri);

        const source = Buffer.from(bytes).toString('utf8');

        const layoutSection = extractDelphineSection(source, 'layout');

        const layoutHtml = extractLitTemplateFromSection(layoutSection.content);

        const frameProperties = parseFramePropertyValues(source);

        return {
                frameName: path.basename(sourceUri.fsPath, path.extname(sourceUri.fsPath)),
                source,
                layoutHtml,
                frameProperties
        };
}
