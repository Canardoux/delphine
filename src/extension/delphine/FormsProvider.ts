import * as vscode from 'vscode';
import * as path from 'path';

export class FormsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
        // Event emitter used to refresh the TreeView
        private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
        readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

        // Called when we want to refresh the Forms list
        public refresh(): void {
                this._onDidChangeTreeData.fire();
        }

        // Return a TreeItem for display
        getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
                return element;
        }

        // Return children of the tree
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

                        const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None);

                        // Store the form URI
                        const formUri = vscode.Uri.file(path.join(formsDir, name, `${name}.html`));

                        // Clicking the item opens the source HTML
                        item.command = {
                                command: 'vscode.open',
                                title: 'Open Form',
                                arguments: [formUri]
                        };

                        forms.push(item);
                }

                return forms;
        }
}
