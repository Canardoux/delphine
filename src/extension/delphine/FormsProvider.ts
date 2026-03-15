import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class FormsProvider implements vscode.TreeDataProvider<FormItem> {
        private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
        readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

        public refresh(): void {
                this._onDidChangeTreeData.fire();
        }

        getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
                return element;
        }

        getChildren(element?: FormItem): Thenable<FormItem[]> {
                if (element) {
                        return Promise.resolve([]);
                }

                const workspace = vscode.workspace.workspaceFolders?.[0];
                if (!workspace) {
                        return Promise.resolve([]);
                }

                const formsDir = path.join(workspace.uri.fsPath, 'src', 'forms');
                if (!fs.existsSync(formsDir)) {
                        return Promise.resolve([]);
                }

                const entries = fs.readdirSync(formsDir, { withFileTypes: true });

                const items = entries
                        .filter((entry) => entry.isDirectory() && entry.name.endsWith('.form'))
                        .map((entry) => {
                                const formName = entry.name.slice(0, -'.form'.length);
                                const formDir = path.join(formsDir, entry.name);
                                const htmlUri = vscode.Uri.file(path.join(formDir, `${formName}.html`));

                                return new FormItem(formName, htmlUri);
                        });

                return Promise.resolve(items);
        }
}
class FormItem extends vscode.TreeItem {
        constructor(
                public readonly formName: string,
                public readonly htmlUri: vscode.Uri
        ) {
                super(formName, vscode.TreeItemCollapsibleState.None);

                this.contextValue = 'delphineForm';
                this.resourceUri = htmlUri;
                this.command = {
                        command: 'delphine.openHtmlSource',
                        title: 'Open Form',
                        arguments: [htmlUri]
                };
        }
}
