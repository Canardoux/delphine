// extension/projectModel.ts

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import type { DelphineAppConfig } from './config/DelphineAppConfig';

export type ResolvedProject = {
        name: string;
        rootDir: vscode.Uri;
        appDir: vscode.Uri; // compatibility alias
        srcDir: vscode.Uri;
        formsDir: vscode.Uri;
        framesDir: vscode.Uri;
        pluginsDir: vscode.Uri;
        applicationTsUri: vscode.Uri;
};

export type ResolvedApp = ResolvedProject;

export type ResolvedUnit = {
        name: string;
        appName: string;
        appDir: vscode.Uri;

        unitKind: 'form' | 'frame';

        dformUri: vscode.Uri;
        tsUri: vscode.Uri;
        unitDir: vscode.Uri;

        // Compatibility aliases
        kind: 'form' | 'frame';
        sourceUri: vscode.Uri;
        codeUri: vscode.Uri;
};

export async function loadAppConfig(appRoot: vscode.Uri): Promise<DelphineAppConfig> {
        const configUri = vscode.Uri.joinPath(appRoot, 'app.json');

        const bytes = await vscode.workspace.fs.readFile(configUri);
        const text = Buffer.from(bytes).toString('utf8');

        return JSON.parse(text) as DelphineAppConfig;
}

export function normalizeToFileUri(input?: unknown): vscode.Uri | undefined {
        if (!input) {
                return undefined;
        }

        if (input instanceof vscode.Uri) {
                return input;
        }

        if (typeof input === 'object') {
                const obj = input as Record<string, unknown>;

                if (obj['uri'] instanceof vscode.Uri) {
                        return obj['uri'];
                }

                if (obj['dformUri'] instanceof vscode.Uri) {
                        return obj['dformUri'];
                }

                if (obj['tsUri'] instanceof vscode.Uri) {
                        return obj['tsUri'];
                }

                if (obj['sourceUri'] instanceof vscode.Uri) {
                        return obj['sourceUri'];
                }

                if (obj['codeUri'] instanceof vscode.Uri) {
                        return obj['codeUri'];
                }

                if (obj['appDir'] instanceof vscode.Uri) {
                        return obj['appDir'];
                }

                if (obj['rootDir'] instanceof vscode.Uri) {
                        return obj['rootDir'];
                }
        }

        return undefined;
}

export function resolveProjectRootFromPath(startPath: string): string | undefined {
        let current = fs.statSync(startPath).isDirectory() ? startPath : path.dirname(startPath);

        for (;;) {
                const packageJson = path.join(current, 'package.json');
                const srcDir = path.join(current, 'src');

                if (fs.existsSync(packageJson) && fs.existsSync(srcDir)) {
                        return current;
                }

                const parent = path.dirname(current);
                if (parent === current) {
                        return undefined;
                }

                current = parent;
        }
}

export function resolveProjectRoot(input?: unknown): string | undefined {
        const uri = normalizeToFileUri(input) ?? vscode.window.activeTextEditor?.document.uri;
        if (!uri || uri.scheme !== 'file') {
                return undefined;
        }

        return resolveProjectRootFromPath(uri.fsPath);
}

export function resolveProject(input?: unknown): ResolvedProject | undefined {
        const uri = normalizeToFileUri(input) ?? vscode.window.activeTextEditor?.document.uri ?? vscode.workspace.workspaceFolders?.[0]?.uri;

        if (!uri || uri.scheme !== 'file') {
                return undefined;
        }

        const projectRoot = resolveProjectRoot(uri);
        if (!projectRoot) {
                return undefined;
        }

        const srcDir = path.join(projectRoot, 'src');
        const formsDir = path.join(srcDir, 'forms');
        const framesDir = path.join(srcDir, 'frames');
        const pluginsDir = path.join(srcDir, 'plugins');
        const applicationTsPath = path.join(srcDir, 'application.ts');

        return {
                name: path.basename(projectRoot),
                rootDir: vscode.Uri.file(projectRoot),
                appDir: vscode.Uri.file(projectRoot),
                srcDir: vscode.Uri.file(srcDir),
                formsDir: vscode.Uri.file(formsDir),
                framesDir: vscode.Uri.file(framesDir),
                pluginsDir: vscode.Uri.file(pluginsDir),
                applicationTsUri: vscode.Uri.file(applicationTsPath)
        };
}

export function resolveApp(input?: unknown): ResolvedApp | undefined {
        return resolveProject(input);
}

export function resolveUnit(uri: vscode.Uri | undefined): ResolvedUnit | undefined {
        if (!uri || uri.scheme !== 'file') {
                return undefined;
        }

        const project = resolveProject(uri);
        if (!project) {
                return undefined;
        }

        const fsPath = uri.fsPath;
        const fileName = path.basename(fsPath);
        const dirName = path.dirname(fsPath);

        const formsDir = project.formsDir.fsPath;
        const framesDir = project.framesDir.fsPath;

        const ext = path.extname(fileName).toLowerCase();
        const baseName = path.basename(fileName, ext);

        if (dirName === formsDir && (ext === '.dform' || ext === '.ts')) {
                const dformUri = vscode.Uri.file(path.join(formsDir, `${baseName}.dform`));
                const tsUri = vscode.Uri.file(path.join(formsDir, `${baseName}.ts`));

                return {
                        name: baseName,
                        appName: project.name,
                        appDir: project.rootDir,
                        unitKind: 'form',
                        dformUri,
                        tsUri,
                        unitDir: vscode.Uri.file(formsDir),

                        kind: 'form',
                        sourceUri: dformUri,
                        codeUri: tsUri
                };
        }

        if (dirName === framesDir && (ext === '.dform' || ext === '.ts')) {
                const dformUri = vscode.Uri.file(path.join(framesDir, `${baseName}.dform`));
                const tsUri = vscode.Uri.file(path.join(framesDir, `${baseName}.ts`));

                return {
                        name: baseName,
                        appName: project.name,
                        appDir: project.rootDir,
                        unitKind: 'frame',
                        dformUri,
                        tsUri,
                        unitDir: vscode.Uri.file(framesDir),

                        kind: 'frame',
                        sourceUri: dformUri,
                        codeUri: tsUri
                };
        }

        return undefined;
}

export function resolveDformUri(input?: unknown): vscode.Uri | undefined {
        const unit = resolveUnit(normalizeToFileUri(input));
        return unit?.dformUri;
}

export function resolveTsUri(input?: unknown): vscode.Uri | undefined {
        const unit = resolveUnit(normalizeToFileUri(input));
        return unit?.tsUri;
}

export function listForms(project: ResolvedProject): ResolvedUnit[] {
        const formsDir = project.formsDir.fsPath;
        if (!fs.existsSync(formsDir)) {
                return [];
        }

        return fs
                .readdirSync(formsDir)
                .filter((name) => name.toLowerCase().endsWith('.dform'))
                .map((name) => {
                        const baseName = path.basename(name, '.dform');
                        const dformUri = vscode.Uri.file(path.join(formsDir, `${baseName}.dform`));
                        const tsUri = vscode.Uri.file(path.join(formsDir, `${baseName}.ts`));

                        return {
                                name: baseName,
                                appName: project.name,
                                appDir: project.rootDir,
                                unitKind: 'form',
                                dformUri,
                                tsUri,
                                unitDir: project.formsDir,

                                kind: 'form',
                                sourceUri: dformUri,
                                codeUri: tsUri
                        };
                });
}

export function listFrames(project: ResolvedProject): ResolvedUnit[] {
        const framesDir = project.framesDir.fsPath;
        if (!fs.existsSync(framesDir)) {
                return [];
        }

        return fs
                .readdirSync(framesDir)
                .filter((name) => name.toLowerCase().endsWith('.dform'))
                .map((name) => {
                        const baseName = path.basename(name, '.dform');
                        const dformUri = vscode.Uri.file(path.join(framesDir, `${baseName}.dform`));
                        const tsUri = vscode.Uri.file(path.join(framesDir, `${baseName}.ts`));

                        return {
                                name: baseName,
                                appName: project.name,
                                appDir: project.rootDir,
                                unitKind: 'frame',
                                dformUri,
                                tsUri,
                                unitDir: project.framesDir,

                                kind: 'frame',
                                sourceUri: dformUri,
                                codeUri: tsUri
                        };
                });
}
