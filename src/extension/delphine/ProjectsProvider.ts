import * as vscode from 'vscode';
import { DelphineItem } from './DelphineItem';
import * as fs from 'fs';
import * as path from 'path';

class ProjectItem extends vscode.TreeItem {
        constructor(public readonly projectUri: vscode.Uri) {
                super(path.basename(projectUri.fsPath), vscode.TreeItemCollapsibleState.Expanded);
                this.contextValue = 'delphineProject';
                this.iconPath = new vscode.ThemeIcon('root-folder');
        }
}

class AppItem extends vscode.TreeItem {
        constructor(
                public readonly appName: string,
                public readonly appUri: vscode.Uri
        ) {
                super(appName, vscode.TreeItemCollapsibleState.Collapsed);
                this.contextValue = 'delphineApp';
                this.iconPath = new vscode.ThemeIcon('rocket');
        }
}

class FormItem extends vscode.TreeItem {
        constructor(
                public readonly formName: string,
                public readonly formDir: vscode.Uri
        ) {
                super(formName, vscode.TreeItemCollapsibleState.Collapsed);
                this.contextValue = 'delphineForm';
                this.iconPath = new vscode.ThemeIcon('symbol-class');
        }

        get htmlUri(): vscode.Uri {
                return vscode.Uri.file(path.join(this.formDir.fsPath, `${this.formName}.html`));
        }

        get tsUri(): vscode.Uri {
                return vscode.Uri.file(path.join(this.formDir.fsPath, `${this.formName}.ts`));
        }

        get cssUri(): vscode.Uri {
                return vscode.Uri.file(path.join(this.formDir.fsPath, `${this.formName}.css`));
        }
}

class FormFileItem extends vscode.TreeItem {
        constructor(
                public readonly fileUri: vscode.Uri,
                label: string
        ) {
                super(label, vscode.TreeItemCollapsibleState.None);

                this.resourceUri = fileUri;
                this.contextValue = 'delphineFormFile';

                this.command = {
                        command: 'vscode.open',
                        title: 'Open File',
                        arguments: [fileUri]
                };
        }
}

class CurrentProjectItem extends vscode.TreeItem {
        constructor(public readonly projectUri: vscode.Uri) {
                super('Current Project', vscode.TreeItemCollapsibleState.Expanded);
                this.contextValue = 'delphineCurrentProject';
                this.iconPath = new vscode.ThemeIcon('folder-opened');
                this.description = path.basename(projectUri.fsPath);
                this.tooltip = projectUri.fsPath;
        }
}

type ProjectTreeItem = ProjectItem | AppItem | FormItem | FormFileItem;

export class ProjectsProvider implements vscode.TreeDataProvider<ProjectTreeItem> {
        private readonly _onDidChangeTreeData = new vscode.EventEmitter<ProjectTreeItem | undefined | void>();
        readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

        refresh(): void {
                this._onDidChangeTreeData.fire();
        }

        getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
                return element;
        }

        getChildren(element?: ProjectTreeItem): Thenable<ProjectTreeItem[]> {
                if (element instanceof CurrentProjectItem) {
                        return Promise.resolve(this.getApps(element));
                }
                if (!element) {
                        return Promise.resolve(this.getProjects());
                }

                if (element instanceof ProjectItem) {
                        return Promise.resolve(this.getApps(element));
                }

                if (element instanceof AppItem) {
                        return Promise.resolve(this.getForms(element));
                }

                if (element instanceof FormItem) {
                        return Promise.resolve(this.getFormFiles(element));
                }

                return Promise.resolve([]);
        }
        private getProjects(): ProjectTreeItem[] {
                const workspace = vscode.workspace.workspaceFolders?.[0];
                if (!workspace) {
                        return [];
                }

                return [new CurrentProjectItem(workspace.uri)];
        }

        private getApps(project: ProjectItem): ProjectTreeItem[] {
                const appsDir = path.join(project.projectUri.fsPath, 'src', 'apps');
                if (!fs.existsSync(appsDir)) {
                        return [];
                }

                return fs
                        .readdirSync(appsDir, { withFileTypes: true })
                        .filter((entry) => entry.isDirectory())
                        .filter((entry) => fs.existsSync(path.join(appsDir, entry.name, 'app.json')))
                        .map((entry) => {
                                const appUri = vscode.Uri.file(path.join(appsDir, entry.name));
                                return new AppItem(entry.name, appUri);
                        })
                        .sort((a, b) => a.appName.localeCompare(b.appName));
        }

        private getFormFiles(form: FormItem): ProjectTreeItem[] {
                const items: ProjectTreeItem[] = [];

                if (fs.existsSync(form.tsUri.fsPath)) {
                        items.push(new FormFileItem(form.tsUri, `${form.formName}.ts`));
                }

                if (fs.existsSync(form.htmlUri.fsPath)) {
                        items.push(new FormFileItem(form.htmlUri, `${form.formName}.html`));
                }

                if (fs.existsSync(form.cssUri.fsPath)) {
                        items.push(new FormFileItem(form.cssUri, `${form.formName}.css`));
                }

                return items;
        }

        private getForms(app: AppItem): ProjectTreeItem[] {
                const formsDir = path.join(app.appUri.fsPath, 'forms');
                if (!fs.existsSync(formsDir)) {
                        return [];
                }

                return fs
                        .readdirSync(formsDir, { withFileTypes: true })
                        .filter((entry) => entry.isDirectory() && entry.name.endsWith('.form'))
                        .map((entry) => {
                                const formName = entry.name.slice(0, -'.form'.length);
                                const formDir = vscode.Uri.file(path.join(formsDir, entry.name));
                                return new FormItem(formName, formDir);
                        })
                        .sort((a, b) => a.formName.localeCompare(b.formName));
        }
}
