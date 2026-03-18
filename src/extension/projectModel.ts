import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export type ResolvedApp = {
        name: string;
        appDir: vscode.Uri;
        appJsonUri: vscode.Uri;
        formsDir: vscode.Uri;
};

export type ResolvedForm = {
        appName: string;
        name: string;
        appDir: vscode.Uri;
        formDir: vscode.Uri;
        htmlUri: vscode.Uri;
        cssUri: vscode.Uri;
        tsUri: vscode.Uri;
};

export function normalizeToFileUri(input?: unknown): vscode.Uri | undefined {
        if (!input) {
                return undefined;
        }

        if (input instanceof vscode.Uri) {
                return input;
        }

        if (typeof input === 'object') {
                const obj = input as Record<string, unknown>;

                if (obj['htmlUri'] instanceof vscode.Uri) {
                        return obj['htmlUri'];
                }

                if (obj['fileUri'] instanceof vscode.Uri) {
                        return obj['fileUri'];
                }

                if (obj['appUri'] instanceof vscode.Uri) {
                        return obj['appUri'];
                }

                if (obj['uri'] instanceof vscode.Uri) {
                        return obj['uri'];
                }
        }

        return undefined;
}

export function resolveProjectRootFromPath(startPath: string): string | undefined {
        let current = fs.statSync(startPath).isDirectory() ? startPath : path.dirname(startPath);

        while (true) {
                const viteConfigTs = path.join(current, 'vite.config.ts');
                const viteConfigJs = path.join(current, 'vite.config.js');
                const packageJson = path.join(current, 'package.json');

                if (fs.existsSync(viteConfigTs) || fs.existsSync(viteConfigJs)) {
                        return current;
                }

                if (fs.existsSync(packageJson)) {
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

        const fsPath = uri.fsPath;
        if (!fsPath) {
                return undefined;
        }

        return resolveProjectRootFromPath(fsPath);
}

export function resolveApp(input?: unknown): ResolvedApp | undefined {
        const uri = normalizeToFileUri(input) ?? vscode.window.activeTextEditor?.document.uri;
        if (!uri || uri.scheme !== 'file') {
                return undefined;
        }

        const fsPath = uri.fsPath;
        if (!fsPath) {
                return undefined;
        }

        let current = fs.existsSync(fsPath) && fs.statSync(fsPath).isDirectory()
                ? fsPath
                : path.dirname(fsPath);

        while (true) {
                const appJsonPath = path.join(current, 'app.json');
                if (fs.existsSync(appJsonPath)) {
                        const appName = path.basename(current);
                        return {
                                name: appName,
                                appDir: vscode.Uri.file(current),
                                appJsonUri: vscode.Uri.file(appJsonPath),
                                formsDir: vscode.Uri.file(path.join(current, 'forms'))
                        };
                }

                const parent = path.dirname(current);
                if (parent === current) {
                        return undefined;
                }

                current = parent;
        }
}

export function resolveForm(input?: unknown): ResolvedForm | undefined {
        const uri = normalizeToFileUri(input) ?? vscode.window.activeTextEditor?.document.uri;
        if (!uri || uri.scheme !== 'file') {
                return undefined;
        }

        const fsPath = uri.fsPath;
        if (!fsPath) {
                return undefined;
        }

        const dir = fs.existsSync(fsPath) && fs.statSync(fsPath).isDirectory()
                ? fsPath
                : path.dirname(fsPath);

        const formDirName = path.basename(dir);
        if (!formDirName.endsWith('.form')) {
                return undefined;
        }

        const app = resolveApp(vscode.Uri.file(dir));
        if (!app) {
                return undefined;
        }

        const formName = formDirName.slice(0, -'.form'.length);

        return {
                                appName: app.name,
                name: formName,
                appDir: app.appDir,
                formDir: vscode.Uri.file(dir),
                htmlUri: vscode.Uri.file(path.join(dir, `${formName}.html`)),
                cssUri: vscode.Uri.file(path.join(dir, `${formName}.css`)),
                tsUri: vscode.Uri.file(path.join(dir, `${formName}.ts`))
        };
}

export function resolveFormSiblingUri(input: unknown, ext: 'html' | 'ts' | 'css'): vscode.Uri | undefined {
        const form = resolveForm(input);
        if (!form) {
                return undefined;
        }

        switch (ext) {
                case 'html':
                        return form.htmlUri;
                case 'ts':
                        return form.tsUri;
                case 'css':
                        return form.cssUri;
        }
}

export function resolveHtmlUri(input?: unknown): vscode.Uri | undefined {
        return resolveFormSiblingUri(input, 'html');
}

export function resolveTsUri(input?: unknown): vscode.Uri | undefined {
        return resolveFormSiblingUri(input, 'ts');
}

export function resolveCssUri(input?: unknown): vscode.Uri | undefined {
        return resolveFormSiblingUri(input, 'css');
}
