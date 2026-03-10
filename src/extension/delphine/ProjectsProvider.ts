import * as vscode from 'vscode';
import { DelphineItem } from './DelphineItem';

export class ProjectsProvider implements vscode.TreeDataProvider<DelphineItem> {
        private readonly _onDidChangeTreeData = new vscode.EventEmitter<DelphineItem | undefined | null | void>();
        readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

        refresh(): void {
                this._onDidChangeTreeData.fire();
        }

        getTreeItem(element: DelphineItem): vscode.TreeItem {
                return element;
        }

        getChildren(element?: DelphineItem): Thenable<DelphineItem[]> {
                if (!element) {
                        return Promise.resolve([
                                new DelphineItem('Current Project', vscode.TreeItemCollapsibleState.Expanded, 'project-root')
                        ]);
                }

                if (element.label === 'Current Project') {
                        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                        const projectName = workspaceFolder?.name ?? '(No project)';
                        return Promise.resolve([
                                new DelphineItem(projectName, vscode.TreeItemCollapsibleState.None, 'project')
                        ]);
                }

                return Promise.resolve([]);
        }
}
