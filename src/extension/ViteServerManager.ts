import { ChildProcess, spawn } from 'child_process';
import { resolveForm, resolveProjectRootFromPath, resolveApp } from './projectModel';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

//import { ensureViteServer } from './ViteServerManager'; // si même fichier, inutile
//import { resolveApp, resolveProjectRootFromPath } from './projectModel';

type ViteServerInfo = {
        projectPath: string;
        port: number;
        process: ChildProcess;
};

const viteServers = new Map<string, ViteServerInfo>();
const viteServerStarts = new Map<string, Promise<ViteServerInfo>>();

function buildAppUrl(port: number, appName: string): string {
        return `http://127.0.0.1:${port}/app.html?app=${encodeURIComponent(appName)}`;
}

export async function runApp(input?: unknown): Promise<void> {
        const app = resolveApp(input);

        if (!app) {
                void vscode.window.showErrorMessage('No App selected');
                return;
        }

        const projectPath = resolveProjectRootFromPath(app.appDir.fsPath);
        if (!projectPath) {
                void vscode.window.showErrorMessage('Unable to find Vite project root');
                return;
        }

        try {
                const vite = await ensureViteServer(projectPath);
                const url = buildAppUrl(vite.port, app.name);

                console.log('[Delphine] runApp project =', projectPath);
                console.log('[Delphine] runApp app =', app.name);
                console.log('[Delphine] runApp port =', vite.port);
                console.log('[Delphine] runApp url =', url);

                await vscode.env.openExternal(vscode.Uri.parse(url));
        } catch (e) {
                console.error(e);
                void vscode.window.showErrorMessage(String(e));
        }
}

export async function ensureViteServer(projectPath: string): Promise<ViteServerInfo> {
        const existing = viteServers.get(projectPath);
        if (existing && existing.process.exitCode === null && !existing.process.killed) {
                console.log('[Delphine] reusing vite server =', projectPath, 'port =', existing.port);
                return existing;
        }

        const starting = viteServerStarts.get(projectPath);
        if (starting) {
                console.log('[Delphine] waiting for vite server startup =', projectPath);
                return starting;
        }

        console.log('[Delphine] starting vite server =', projectPath);

        const promise = startViteServer(projectPath)
                .then((info) => {
                        viteServers.set(projectPath, info);
                        viteServerStarts.delete(projectPath);
                        return info;
                })
                .catch((err) => {
                        viteServerStarts.delete(projectPath);
                        throw err;
                });

        viteServerStarts.set(projectPath, promise);
        return promise;
}

async function startViteServer(projectPath: string): Promise<ViteServerInfo> {
        let fullOutput = '';
        return new Promise((resolve, reject) => {
                const child = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1'], {
                        cwd: projectPath,
                        shell: true,
                        stdio: ['ignore', 'pipe', 'pipe']
                });

                let resolved = false;

                const onData = (chunk: Buffer): void => {
                        const text = chunk.toString();
                        fullOutput += text;
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

                                console.log('[Delphine] vite ready =', projectPath, 'port =', port);
                                resolve(info);
                        }
                };

                child.stdout?.on('data', onData);
                child.stderr?.on('data', onData);

                child.on('error', (err) => {
                        viteServers.delete(projectPath);
                        reject(err);
                });

                child.on('exit', (code) => {
                        viteServers.delete(projectPath);
                        if (!resolved) {
                                if (fullOutput.includes('vite: command not found')) {
                                        reject(new Error('Vite is not installed for this project. Run npm install in the project folder.'));
                                        return;
                                }

                                reject(new Error(`Vite exited before startup (code ${code})`));
                        }
                });
        });
}

export function disposeAllViteServers(): void {
        for (const [, server] of viteServers) {
                try {
                        server.process.kill();
                } catch {
                        // ignore
                }
        }
        viteServers.clear();
        viteServerStarts.clear();
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

function buildPreviewUrl(port: number, appName: string, formName: string): string {
        return `http://127.0.0.1:${port}/preview.html?app=${encodeURIComponent(appName)}&form=${encodeURIComponent(formName)}`;
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

        const projectPath = resolveProjectRootFromPath(form.formDir.fsPath);
        if (!projectPath) {
                void vscode.window.showErrorMessage('Unable to find Vite project root');
                return;
        }

        const vite = await ensureViteServer(projectPath);
        const url = buildPreviewUrl(vite.port, form.appName, form.name);

        await vscode.env.openExternal(vscode.Uri.parse(url));
}

export async function previewOnViteInVsCode(context: vscode.ExtensionContext, uri: vscode.Uri | undefined): Promise<void> {
        const form = resolveForm(uri);
        if (!form) {
                void vscode.window.showInformationMessage('No Delphine Form selected');
                return;
        }

        const projectPath = resolveProjectRootFromPath(form.formDir.fsPath);
        if (!projectPath) {
                void vscode.window.showErrorMessage('Unable to find Vite project root');
                return;
        }

        const vite = await ensureViteServer(projectPath);
        const url = buildPreviewUrl(vite.port, form.appName, form.name);

        // createRuntimePreviewPanel(context, url);
}

export async function getPreviewUrlForForm(uri: vscode.Uri | undefined): Promise<string> {
        const form = resolveForm(uri);
        if (!form) {
                throw new Error('No Delphine Form selected');
        }

        const projectPath = resolveProjectRootFromPath(form.formDir.fsPath);
        if (!projectPath) {
                throw new Error('Unable to find Vite project root');
        }

        const vite = await ensureViteServer(projectPath);
        const url = buildPreviewUrl(vite.port, form.appName, form.name);

        console.log('[Delphine] preview project =', projectPath);
        console.log('[Delphine] preview app =', form.appName);
        console.log('[Delphine] preview form =', form.name);
        console.log('[Delphine] preview port =', vite.port);
        console.log('[Delphine] preview url =', url);

        return url;
}

function resolveAppUri(input?: unknown): vscode.Uri | undefined {
        if (!input) {
                return undefined;
        }

        if (input instanceof vscode.Uri) {
                return input;
        }

        if (typeof input === 'object') {
                const obj = input as Record<string, unknown>;

                if (obj['appUri'] instanceof vscode.Uri) {
                        return obj['appUri'];
                }

                if (obj['uri'] instanceof vscode.Uri) {
                        return obj['uri'];
                }
        }

        return undefined;
}
