import { ChildProcess, spawn } from 'child_process';

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export type ResolvedForm = {
        name: string;
        formDir: vscode.Uri;
        htmlUri: vscode.Uri;
        cssUri: vscode.Uri;
        tsUri: vscode.Uri;
        jsonUri: vscode.Uri;
};

type ViteServerInfo = {
        projectPath: string;
        port: number;
        process: ChildProcess;
};

const viteServers = new Map<string, ViteServerInfo>();

export async function ensureViteServer(projectPath: string): Promise<ViteServerInfo> {
        const existing = viteServers.get(projectPath);

        if (existing && existing.process.exitCode === null && !existing.process.killed) {
                console.log('[Delphine] preview url =', existing?.projectPath, existing?.port);
                return existing;
        }
        console.log('[Delphine] startviteServer =', projectPath);

        return startViteServer(projectPath);
}

async function startViteServer(projectPath: string): Promise<ViteServerInfo> {
        return new Promise((resolve, reject) => {
                const child = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1'], {
                        cwd: projectPath,
                        shell: true,
                        stdio: ['ignore', 'pipe', 'pipe']
                });

                let resolved = false;

                const onData = (chunk: Buffer): void => {
                        const text = chunk.toString();
                        console.log('[Delphine/Vite]', text);

                        const match = text.match(/Local:\s+http:\/\/localhost:(\d+)\//) ?? text.match(/Local:\s+http:\/\/127\.0\.0\.1:(\d+)\//);

                        if (match && !resolved) {
                                resolved = true;

                                const port = Number(match[1]);
                                const info: ViteServerInfo = {
                                        projectPath,
                                        port,
                                        process: child
                                };
                                console.log('Server Vite Info', info);

                                viteServers.set(projectPath, info);
                                resolve(info);
                        }
                };

                child.stdout?.on('data', onData);
                child.stderr?.on('data', onData);

                child.on('error', (err) => {
                        viteServers.delete(projectPath);
                        if (!resolved) {
                                reject(err);
                        }
                });

                child.on('exit', (code) => {
                        viteServers.delete(projectPath);
                        if (!resolved) {
                                reject(new Error(`Vite exited before startup (code ${code})`));
                        }
                });
        });
}

function findProjectRoot(startPath: string): string | undefined {
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

export function disposeAllViteServers(): void {
        for (const [, server] of viteServers) {
                server.process.kill();
        }
        viteServers.clear();
}

export function normalizeToFileUri(input: unknown): vscode.Uri | undefined {
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

                if (obj['uri'] instanceof vscode.Uri) {
                        return obj['uri'];
                }

                if (typeof obj['fsPath'] === 'string') {
                        return vscode.Uri.file(obj['fsPath']);
                }
        }

        return undefined;
}

export function resolveForm(input: unknown): ResolvedForm | undefined {
        const uri = normalizeToFileUri(input);
        if (!uri) {
                return undefined;
        }

        if (uri.scheme !== 'file') {
                return undefined;
        }

        const fsPath = uri.fsPath;
        if (!fsPath) {
                return undefined;
        }

        const dir = fs.statSync(fsPath).isDirectory() ? fsPath : path.dirname(fsPath);
        const formDirName = path.basename(dir);

        if (!formDirName.endsWith('.form')) {
                return undefined;
        }

        const name = formDirName.slice(0, -'.form'.length);

        return {
                name,
                formDir: vscode.Uri.file(dir),
                htmlUri: vscode.Uri.file(path.join(dir, `${name}.html`)),
                cssUri: vscode.Uri.file(path.join(dir, `${name}.css`)),
                tsUri: vscode.Uri.file(path.join(dir, `${name}.ts`)),
                jsonUri: vscode.Uri.file(path.join(dir, `${name}.json`))
        };
}

function buildPreviewUrl(port: number, formName: string): string {
        return `http://127.0.0.1:${port}/src/preview.html?form=${encodeURIComponent(formName)}`;
}
export async function previewOnViteInBrowser(uri: vscode.Uri | undefined): Promise<void> {
        console.log('[Delphine] uri =', uri);
        console.log('[Delphine] typeof uri =', typeof uri);
        console.log('[Delphine] instanceof vscode.Uri =', uri instanceof vscode.Uri);
        const form = resolveForm(uri);
        if (!form) {
                void vscode.window.showInformationMessage('No Delphine Form selected');
                return;
        }

        const projectPath = findProjectRoot(form.formDir.fsPath);
        if (!projectPath) {
                void vscode.window.showErrorMessage('Unable to find Vite project root');
                return;
        }

        const vite = await ensureViteServer(projectPath);
        const url = buildPreviewUrl(vite.port, form.name);

        await vscode.env.openExternal(vscode.Uri.parse(url));
}

export async function previewOnViteInVsCode(context: vscode.ExtensionContext, uri: vscode.Uri | undefined): Promise<void> {
        const form = resolveForm(uri);
        if (!form) {
                void vscode.window.showInformationMessage('No Delphine Form selected');
                return;
        }

        const projectPath = findProjectRoot(form.formDir.fsPath);
        if (!projectPath) {
                void vscode.window.showErrorMessage('Unable to find Vite project root');
                return;
        }

        const vite = await ensureViteServer(projectPath);
        const url = buildPreviewUrl(vite.port, form.name);

        //createRuntimePreviewPanel(context, url);
}

export async function getPreviewUrlForForm(uri: vscode.Uri | undefined): Promise<string> {
        const form = resolveForm(uri);
        if (!form) {
                throw new Error('No Delphine Form selected');
        }

        const projectPath = findProjectRoot(form.formDir.fsPath);
        if (!projectPath) {
                throw new Error('Unable to find Vite project root');
        }

        const vite = await ensureViteServer(projectPath);
        const url = buildPreviewUrl(vite.port, form.name);

        console.log('[Delphine] preview project =', projectPath);
        console.log('[Delphine] preview port =', vite.port);
        console.log('[Delphine] preview url =', url);

        return url;
}
