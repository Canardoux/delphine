import * as vscode from 'vscode';
import { PreviewPanel } from './preview/PreviewPanel';
import { DelphineCustomEditorProvider } from './editor/DelphineCustomEditorProvider';

function resolveTargetUri(uri?: unknown): vscode.Uri | undefined {
        if (uri instanceof vscode.Uri && uri.scheme === 'file') {
                return uri;
        }

        const editorUri = vscode.window.activeTextEditor?.document.uri;
        if (editorUri && editorUri.scheme === 'file') {
                return editorUri;
        }

        return PreviewPanel.getActiveDocUri();
}

export function activate(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.preview', async (uri?: unknown) => {
                        const targetUri = resolveTargetUri(uri);
                        if (!targetUri) {
                                void vscode.window.showInformationMessage('No target document');
                                return;
                        }

                        await PreviewPanel.createOrShow(context, targetUri);
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openEditor', async (uri?: unknown) => {
                        const targetUri = resolveTargetUri(uri);
                        if (!targetUri) {
                                void vscode.window.showInformationMessage('No target document');
                                return;
                        }

                        await vscode.commands.executeCommand('vscode.openWith', targetUri, 'delphine.customEditor');
                })
        );

        context.subscriptions.push(
                vscode.commands.registerCommand('delphine.openSource', async (uri?: unknown) => {
                        const targetUri = resolveTargetUri(uri);
                        if (!targetUri) {
                                void vscode.window.showInformationMessage('No target document');
                                return;
                        }

                        await vscode.window.showTextDocument(targetUri, {
                                preview: false,
                                viewColumn: vscode.ViewColumn.One
                        });
                })
        );

        context.subscriptions.push(DelphineCustomEditorProvider.register(context));
}

export function deactivate(): void {
        // Nothing to do.
}
