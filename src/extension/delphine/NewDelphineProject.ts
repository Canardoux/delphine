import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { spawn } from 'child_process';

export async function runNpmInstall(projectPath: string): Promise<void> {
        console.log('[Delphine] starting npm install for new project:', projectPath);
        await vscode.window.withProgress(
                {
                        location: vscode.ProgressLocation.Notification,
                        title: 'Installing project dependencies',
                        cancellable: false
                },
                () =>
                        new Promise<void>((resolve, reject) => {
                                const child = spawn('npm', ['install'], {
                                        cwd: projectPath,
                                        shell: true,
                                        stdio: ['ignore', 'pipe', 'pipe']
                                });

                                let output = '';

                                const onData = (chunk: Buffer): void => {
                                        const text = chunk.toString();
                                        output += text;
                                        console.log('[Delphine/npm]', text);
                                };

                                child.stdout?.on('data', onData);
                                child.stderr?.on('data', onData);

                                child.on('error', (err) => {
                                        reject(err);
                                });

                                child.on('exit', (code) => {
                                        if (code === 0) {
                                                resolve();
                                                return;
                                        }

                                        if (output.includes('npm: command not found') || output.includes('npm command not found') || output.includes('npm n’est pas reconnu') || output.includes('not recognized as an internal or external command')) {
                                                reject(new Error('npm was not found. Please install Node.js and npm, then run npm install in the project folder.'));
                                                return;
                                        }

                                        reject(new Error(`npm install failed (code ${code})`));
                                });
                        })
        );
        console.log('[Delphine] npm install completed for:', projectPath);
}

/**
 * Copy a directory recursively while skipping unwanted files.
 */
function copyDirectoryRecursive(sourceDir: string, targetDir: string): void {
        fs.mkdirSync(targetDir, { recursive: true });

        const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

        for (const entry of entries) {
                if (entry.name === 'node_modules' || entry.name === '.DS_Store') {
                        continue;
                }

                const sourcePath = path.join(sourceDir, entry.name);
                const targetPath = path.join(targetDir, entry.name);

                if (entry.isDirectory()) {
                        copyDirectoryRecursive(sourcePath, targetPath);
                } else {
                        fs.copyFileSync(sourcePath, targetPath);
                }
        }
}

/**
 * Optionally patch minimal project metadata after template copy.
 * For now we only update the project name inside delphine.json if present.
 */
function patchNewProjectFiles(projectPath: string, projectName: string): void {
        const delphineJsonPath = path.join(projectPath, 'delphine.json');

        if (fs.existsSync(delphineJsonPath)) {
                try {
                        const raw = fs.readFileSync(delphineJsonPath, 'utf8');
                        const json = JSON.parse(raw) as Record<string, unknown>;

                        json.name = projectName;

                        fs.writeFileSync(delphineJsonPath, JSON.stringify(json, null, 2) + '\n', 'utf8');
                } catch (error) {
                        console.error('[Delphine] Failed to patch delphine.json:', error);
                }
        }
}

function ucfirst(name: string): string {
        if (!name) {
                return name;
        }

        return name[0].toUpperCase() + name.slice(1);
}
/**
 * Create a new Delphine project from the on-disk template.
 */
export async function newDelphineProject(context: vscode.ExtensionContext): Promise<void> {
        const rawName = await vscode.window.showInputBox({
                prompt: 'Project name',
                placeHolder: 'MyProject',
                ignoreFocusOut: true,
                validateInput: (value) => {
                        const trimmed = value.trim();

                        if (!trimmed) {
                                return 'Project name is required';
                        }

                        if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
                                return 'Use only letters, digits, dash and underscore';
                        }

                        return null;
                }
        });

        if (!rawName) {
                return;
        }

        const projectName = ucfirst(rawName.trim());

        const selectedFolder = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Select parent folder'
        });

        if (!selectedFolder || selectedFolder.length === 0) {
                return;
        }

        const parentDir = selectedFolder[0].fsPath;
        const projectPath = path.join(parentDir, projectName);

        if (fs.existsSync(projectPath)) {
                void vscode.window.showErrorMessage(`Folder already exists: ${projectPath}`);
                return;
        }

        const templatePath = path.join(context.extensionPath, 'templates', 'project');

        if (!fs.existsSync(templatePath)) {
                void vscode.window.showErrorMessage(`Project template not found: ${templatePath}`);
                return;
        }

        try {
                try {
                        copyDirectoryRecursive(templatePath, projectPath);
                        patchNewProjectFiles(projectPath, projectName);

                        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath));

                        void runNpmInstall(projectPath).then(
                                () => {
                                        void vscode.window.showInformationMessage('Project created and dependencies installed.');
                                },
                                (error) => {
                                        console.error('[Delphine] npm install failed:', error);
                                        void vscode.window.showErrorMessage(String(error));
                                }
                        );
                } catch (error) {
                        console.error('[Delphine] newProject failed:', error);
                        void vscode.window.showErrorMessage(`Unable to create project: ${String(error)}`);
                }
                patchNewProjectFiles(projectPath, projectName);

                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath));
        } catch (error) {
                console.error('[Delphine] newProject failed:', error);
                void vscode.window.showErrorMessage(`Unable to create project: ${String(error)}`);
        }
}
