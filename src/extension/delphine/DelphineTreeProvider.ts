import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

type NodeType = 'project' | 'app' | 'formsFolder' | 'framesFolder' | 'form' | 'frame' | 'formFile' | 'frameFile';

export class DelphineTreeItem extends vscode.TreeItem {
        constructor(
                public readonly type: NodeType,
                public readonly fullPath: string,
                label: string,
                collapsibleState: vscode.TreeItemCollapsibleState,
                public readonly parentName?: string
        ) {
                super(label, collapsibleState);
                this.contextValue = type;

                if (type === 'formFile' || type === 'frameFile') {
                        this.command = {
                                command: 'vscode.open',
                                title: 'Open File',
                                arguments: [vscode.Uri.file(fullPath)]
                        };
                }
        }
}

export class DelphineTreeProvider implements vscode.TreeDataProvider<DelphineTreeItem> {
        private _onDidChangeTreeData = new vscode.EventEmitter<DelphineTreeItem | undefined | null | void>();
        readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

        constructor(private workspaceRoot: string | undefined) {}

        refresh() {
                this._onDidChangeTreeData.fire();
        }

        getTreeItem(element: DelphineTreeItem): vscode.TreeItem {
                return element;
        }

        getChildren(element?: DelphineTreeItem): Thenable<DelphineTreeItem[]> {
                if (!this.workspaceRoot) {
                        return Promise.resolve([]);
                }

                if (!element) {
                        return Promise.resolve([new DelphineTreeItem('project', this.workspaceRoot, path.basename(this.workspaceRoot), vscode.TreeItemCollapsibleState.Expanded)]);
                }

                if (element.type === 'project') {
                        return Promise.resolve(this.findApps(element.fullPath));
                }

                if (element.type === 'app') {
                        return Promise.resolve([new DelphineTreeItem('formsFolder', element.fullPath, 'Forms', vscode.TreeItemCollapsibleState.Expanded), new DelphineTreeItem('framesFolder', element.fullPath, 'Frames', vscode.TreeItemCollapsibleState.Expanded)]);
                }

                if (element.type === 'formsFolder') {
                        return Promise.resolve(this.findForms(element.fullPath));
                }

                if (element.type === 'framesFolder') {
                        return Promise.resolve(this.findFrames(element.fullPath));
                }

                if (element.type === 'form') {
                        return Promise.resolve(this.findFormFiles(element.fullPath, element.label as string));
                }

                if (element.type === 'frame') {
                        return Promise.resolve(this.findFrameFiles(element.fullPath, element.label as string));
                }

                return Promise.resolve([]);
        }

        private findApps(projectRoot: string): DelphineTreeItem[] {
                const result: DelphineTreeItem[] = [];
                const appsRoot = path.join(projectRoot, 'src', 'apps');

                if (!fs.existsSync(appsRoot)) {
                        return result;
                }

                const entries = fs.readdirSync(appsRoot, { withFileTypes: true });
                for (const entry of entries) {
                        if (!entry.isDirectory()) continue;

                        const full = path.join(appsRoot, entry.name);
                        result.push(new DelphineTreeItem('app', full, entry.name, vscode.TreeItemCollapsibleState.Collapsed));
                }

                result.sort((a, b) => String(a.label).localeCompare(String(b.label)));
                return result;
        }

        private findForms(appRoot: string): DelphineTreeItem[] {
                const result: DelphineTreeItem[] = [];
                const root = path.join(appRoot, 'forms');
                const visited = new Set<string>();

                this.scan(root, '.form', 'form', result, visited);
                result.sort((a, b) => String(a.label).localeCompare(String(b.label)));
                return result;
        }

        private findFrames(appRoot: string): DelphineTreeItem[] {
                const result: DelphineTreeItem[] = [];
                const root = path.join(appRoot, 'frames');
                const visited = new Set<string>();

                this.scan(root, '.frame', 'frame', result, visited);
                result.sort((a, b) => String(a.label).localeCompare(String(b.label)));
                return result;
        }

        private findFormFiles(formDir: string, formName: string): DelphineTreeItem[] {
                const result: DelphineTreeItem[] = [];
                const fileNames = [`${formName}.html`, `${formName}.ts`, `${formName}.css`, `${formName}.json`];

                for (const fileName of fileNames) {
                        const full = path.join(formDir, fileName);
                        if (fs.existsSync(full)) {
                                result.push(new DelphineTreeItem('formFile', full, fileName, vscode.TreeItemCollapsibleState.None, formName));
                        }
                }

                return result;
        }

        private findFrameFiles(frameDir: string, frameName: string): DelphineTreeItem[] {
                const result: DelphineTreeItem[] = [];
                const fileNames = [`${frameName}.html`, `${frameName}.ts`, `${frameName}.css`, `${frameName}.json`];

                for (const fileName of fileNames) {
                        const full = path.join(frameDir, fileName);
                        if (fs.existsSync(full)) {
                                result.push(new DelphineTreeItem('frameFile', full, fileName, vscode.TreeItemCollapsibleState.None, frameName));
                        }
                }

                return result;
        }

        private scan(dir: string, suffix: string, type: NodeType, result: DelphineTreeItem[], visited: Set<string>) {
                if (!fs.existsSync(dir)) return;

                const entries = fs.readdirSync(dir, { withFileTypes: true });

                for (const entry of entries) {
                        const full = path.join(dir, entry.name);

                        if (entry.isDirectory()) {
                                if (entry.name.endsWith(suffix)) {
                                        if (!visited.has(full)) {
                                                visited.add(full);

                                                const name = entry.name.substring(0, entry.name.length - suffix.length);

                                                result.push(new DelphineTreeItem(type, full, name, vscode.TreeItemCollapsibleState.Collapsed));
                                        }
                                } else {
                                        this.scan(full, suffix, type, result, visited);
                                }
                        }
                }
        }
}
