import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Parent node representing one Delphine form.
 */
class FormItem extends vscode.TreeItem {
        public readonly formName: string;
        public readonly formDir: vscode.Uri;
        public readonly htmlUri: vscode.Uri;
        public readonly tsUri: vscode.Uri;
        public readonly cssUri: vscode.Uri;

        constructor(formName: string, formDir: vscode.Uri) {
                super(formName, vscode.TreeItemCollapsibleState.Collapsed);

                this.formName = formName;
                this.formDir = formDir;
                this.htmlUri = vscode.Uri.file(path.join(formDir.fsPath, `${formName}.html`));
                this.tsUri = vscode.Uri.file(path.join(formDir.fsPath, `${formName}.ts`));
                this.cssUri = vscode.Uri.file(path.join(formDir.fsPath, `${formName}.css`));

                this.contextValue = 'delphineForm';
                this.iconPath = new vscode.ThemeIcon('symbol-class');
        }
}

/**
 * Child node representing one physical file inside a form.
 */
class FormFileItem extends vscode.TreeItem {
        public readonly fileUri: vscode.Uri;

        constructor(fileUri: vscode.Uri, label: string) {
                super(label, vscode.TreeItemCollapsibleState.None);

                this.fileUri = fileUri;
                this.resourceUri = fileUri;
                this.contextValue = 'delphineFormFile';

                this.command = {
                        command: 'vscode.open',
                        title: 'Open File',
                        arguments: [fileUri]
                };
        }
}

type FormsTreeItem = FormItem | FormFileItem;

export class FormsProvider implements vscode.TreeDataProvider<FormsTreeItem> {
        private readonly _onDidChangeTreeData = new vscode.EventEmitter<FormsTreeItem | undefined | void>();
        public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

        public refresh(): void {
                this._onDidChangeTreeData.fire();
        }

        public getTreeItem(element: FormsTreeItem): vscode.TreeItem {
                return element;
        }

        public getChildren(element?: FormsTreeItem): Thenable<FormsTreeItem[]> {
                if (!element) {
                        return Promise.resolve(this.getRootForms());
                }

                if (element instanceof FormItem) {
                        return Promise.resolve(this.getFormFiles(element));
                }

                return Promise.resolve([]);
        }

        private getRootForms(): FormsTreeItem[] {
                const workspace = vscode.workspace.workspaceFolders?.[0];
                if (!workspace) {
                        return [];
                }

                const formsDir = path.join(workspace.uri.fsPath, 'src', 'forms');
                if (!fs.existsSync(formsDir)) {
                        return [];
                }

                const entries = fs.readdirSync(formsDir, { withFileTypes: true });

                const items = entries
                        .filter((entry) => entry.isDirectory() && entry.name.endsWith('.form'))
                        .map((entry) => {
                                const formName = entry.name.slice(0, -'.form'.length);
                                const formDir = vscode.Uri.file(path.join(formsDir, entry.name));
                                return new FormItem(formName, formDir);
                        })
                        .sort((a, b) => a.formName.localeCompare(b.formName));

                return items;
        }

        private getFormFiles(form: FormItem): FormsTreeItem[] {
                const children: FormsTreeItem[] = [];

                if (fs.existsSync(form.tsUri.fsPath)) {
                        children.push(new FormFileItem(form.tsUri, `${form.formName}.ts`));
                }

                if (fs.existsSync(form.htmlUri.fsPath)) {
                        children.push(new FormFileItem(form.htmlUri, `${form.formName}.html`));
                }

                if (fs.existsSync(form.cssUri.fsPath)) {
                        children.push(new FormFileItem(form.cssUri, `${form.formName}.css`));
                }

                return children;
        }
}
