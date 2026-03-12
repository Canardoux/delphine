import * as vscode from 'vscode';
import * as path from 'path';

export class FormsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
        private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
        readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

        public refresh(): void {
                this._onDidChangeTreeData.fire();
        }

        getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
                return element;
        }

        async getChildren(): Promise<vscode.TreeItem[]> {
                const workspace = vscode.workspace.workspaceFolders?.[0];
                if (!workspace) {
                        return [];
                }

                const formsDir = path.join(workspace.uri.fsPath, 'src', 'forms');

                let entries: [string, vscode.FileType][];
                try {
                        entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(formsDir));
                } catch {
                        return [];
                }

                const forms: vscode.TreeItem[] = [];

                for (const [name, type] of entries) {
                        if (type !== vscode.FileType.Directory) {
                                continue;
                        }

                        const htmlUri = vscode.Uri.file(path.join(formsDir, name, `${name}.html`));

                        const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None);
                        item.contextValue = 'delphineForm';
                        item.resourceUri = htmlUri;

                        item.command = {
                                command: 'delphine.openHtmlSource',
                                title: 'Open HTML Source',
                                arguments: [htmlUri]
                        };

                        forms.push(item);
                }

                return forms;
        }
}
