import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';

import { listForms, listFrames, resolveProject, type ResolvedProject, type ResolvedUnit } from '../projectModel.js';

export type DelphineTreeItemType = 'project' | 'applicationFile' | 'formsFolder' | 'framesFolder' | 'pluginsFolder' | 'form' | 'frame' | 'dformFile' | 'tsFile';

export class DelphineTreeItem extends vscode.TreeItem {
        public readonly type: DelphineTreeItemType;
        public readonly fileUri?: vscode.Uri;
        public readonly project?: ResolvedProject;
        public readonly unit?: ResolvedUnit;

        public constructor(opts: {
                label: string;
                type: DelphineTreeItemType;
                collapsibleState: vscode.TreeItemCollapsibleState;
                fileUri?: vscode.Uri;
                project?: ResolvedProject;
                unit?: ResolvedUnit;
                description?: string;
                tooltip?: string;
                contextValue?: string;
                command?: vscode.Command;
        }) {
                super(opts.label, opts.collapsibleState);

                this.type = opts.type;
                this.fileUri = opts.fileUri;
                this.project = opts.project;
                this.unit = opts.unit;

                this.description = opts.description;
                this.tooltip = opts.tooltip;
                this.contextValue = opts.contextValue ?? opts.type;
                this.command = opts.command;

                if (opts.fileUri) {
                        this.resourceUri = opts.fileUri;
                }
        }
}

export class DelphineTreeProvider implements vscode.TreeDataProvider<DelphineTreeItem> {
        private readonly _onDidChangeTreeData = new vscode.EventEmitter<DelphineTreeItem | undefined | void>();
        public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

        public refresh(): void {
                this._onDidChangeTreeData.fire();
        }

        public getTreeItem(element: DelphineTreeItem): vscode.TreeItem {
                return element;
        }

        public getChildren(element?: DelphineTreeItem): Thenable<DelphineTreeItem[]> {
                if (!element) {
                        return Promise.resolve(this.getRootItems());
                }

                switch (element.type) {
                        case 'project':
                                return Promise.resolve(this.getProjectChildren(element.project));

                        case 'formsFolder':
                                return Promise.resolve(this.getFormItems(element.project));

                        case 'framesFolder':
                                return Promise.resolve(this.getFrameItems(element.project));
                        case 'form':
                        case 'frame':
                                return Promise.resolve(element.unit && element.project ? this.getUnitFileItems(element.unit, element.project) : []);

                        case 'pluginsFolder':
                        case 'applicationFile':
                                return Promise.resolve([]);
                }

                return Promise.resolve([]);
        }

        private getUnitFileItems(unit: ResolvedUnit, project: ResolvedProject): DelphineTreeItem[] {
                return [
                        new DelphineTreeItem({
                                label: `${unit.name}.dform`,
                                type: 'dformFile',
                                project,
                                unit,
                                fileUri: unit.sourceUri,
                                collapsibleState: vscode.TreeItemCollapsibleState.None,
                                tooltip: unit.sourceUri.fsPath,
                                contextValue: 'dformFile',
                                command: {
                                        command: 'vscode.open',
                                        title: 'Open dform source',
                                        arguments: [unit.sourceUri]
                                }
                        }),
                        new DelphineTreeItem({
                                label: `${unit.name}.ts`,
                                type: 'tsFile',
                                project,
                                unit,
                                fileUri: unit.codeUri,
                                collapsibleState: vscode.TreeItemCollapsibleState.None,
                                tooltip: unit.codeUri.fsPath,
                                contextValue: 'tsFile',
                                command: {
                                        command: 'vscode.open',
                                        title: 'Open TypeScript code',
                                        arguments: [unit.codeUri]
                                }
                        })
                ];
        }

        private getRootItems(): DelphineTreeItem[] {
                const project = resolveProject();

                if (!project) {
                        return [
                                new DelphineTreeItem({
                                        label: 'No Delphine project found',
                                        type: 'project',
                                        collapsibleState: vscode.TreeItemCollapsibleState.None,
                                        description: 'Open a folder containing src/application.ts',
                                        tooltip: 'Delphine expects a project containing src/application.ts',
                                        contextValue: 'empty'
                                })
                        ];
                }

                const projectName = path.basename(project.rootDir.fsPath);

                return [
                        new DelphineTreeItem({
                                label: projectName,
                                type: 'project',
                                project,
                                fileUri: project.rootDir,
                                collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                                tooltip: project.rootDir.fsPath,
                                contextValue: 'project'
                        })
                ];
        }

        private getProjectChildren(project: ResolvedProject | undefined): DelphineTreeItem[] {
                if (!project) {
                        return [];
                }

                const items: DelphineTreeItem[] = [];

                items.push(
                        new DelphineTreeItem({
                                label: 'application.ts',
                                type: 'applicationFile',
                                project,
                                fileUri: project.applicationTsUri,
                                collapsibleState: vscode.TreeItemCollapsibleState.None,
                                tooltip: project.applicationTsUri.fsPath,
                                contextValue: 'applicationFile',
                                command: {
                                        command: 'vscode.open',
                                        title: 'Open application.ts',
                                        arguments: [project.applicationTsUri]
                                }
                        })
                );

                items.push(
                        new DelphineTreeItem({
                                label: 'forms',
                                type: 'formsFolder',
                                project,
                                fileUri: project.formsDir,
                                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                                tooltip: project.formsDir.fsPath,
                                contextValue: 'formsFolder'
                        })
                );

                items.push(
                        new DelphineTreeItem({
                                label: 'frames',
                                type: 'framesFolder',
                                project,
                                fileUri: project.framesDir,
                                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                                tooltip: project.framesDir.fsPath,
                                contextValue: 'framesFolder'
                        })
                );

                items.push(
                        new DelphineTreeItem({
                                label: 'plugins',
                                type: 'pluginsFolder',
                                project,
                                fileUri: project.pluginsDir,
                                collapsibleState: vscode.TreeItemCollapsibleState.None,
                                tooltip: project.pluginsDir.fsPath,
                                contextValue: 'pluginsFolder',
                                command: {
                                        command: 'vscode.openFolder',
                                        title: 'Open plugins folder',
                                        arguments: [project.pluginsDir, false]
                                }
                        })
                );

                return items;
        }

        private getFormItems(project: ResolvedProject | undefined): DelphineTreeItem[] {
                if (!project) {
                        return [];
                }

                return listForms(project).map((unit: ResolvedUnit) => {
                        return new DelphineTreeItem({
                                label: unit.name,
                                type: 'form',
                                project,
                                unit,
                                fileUri: unit.sourceUri,
                                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                                description: 'form',
                                tooltip: this.buildUnitTooltip(unit),
                                contextValue: 'form',
                                command: {
                                        command: 'delphine.openEditor',
                                        title: 'Open Delphine Editor',
                                        arguments: [unit.sourceUri]
                                }
                        });
                });
        }

        private getFrameItems(project: ResolvedProject | undefined): DelphineTreeItem[] {
                if (!project) {
                        return [];
                }

                return listFrames(project).map((unit: ResolvedUnit) => {
                        return new DelphineTreeItem({
                                label: unit.name,
                                type: 'frame',
                                project,
                                unit,
                                fileUri: unit.sourceUri,
                                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                                description: 'frame',
                                tooltip: this.buildUnitTooltip(unit),
                                contextValue: 'frame',
                                command: {
                                        command: 'delphine.openEditor',
                                        title: 'Open Delphine Editor',
                                        arguments: [unit.sourceUri]
                                }
                        });
                });
        }

        private buildUnitTooltip(unit: ResolvedUnit): string {
                return [`${unit.kind}: ${unit.name}`, '', `.dform: ${unit.sourceUri.fsPath}`, `.ts: ${unit.codeUri.fsPath}`].join('\n');
        }
}

/**
 * Returns true if the given directory exists.
 */
export function directoryExists(uri: vscode.Uri): boolean {
        try {
                return fs.statSync(uri.fsPath).isDirectory();
        } catch {
                return false;
        }
}

/**
 * Returns the default Delphine root candidates from the current workspace.
 */
export function findDelphineProjectRoots(): vscode.Uri[] {
        const folders = vscode.workspace.workspaceFolders ?? [];
        const results: vscode.Uri[] = [];

        for (const folder of folders) {
                const applicationTs = vscode.Uri.joinPath(folder.uri, 'src', 'application.ts');
                if (fs.existsSync(applicationTs.fsPath)) {
                        results.push(folder.uri);
                }
        }

        return results;
}
