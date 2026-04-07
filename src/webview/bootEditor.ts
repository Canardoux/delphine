//import * as vscode from 'vscode';
import grapesjs from 'grapesjs';
import { TTypeRegistry } from '../vcl/TypeRegistry.js';
import { registerBuiltins } from '../vcl/RegisterVcl.js';
import { registerDelphineComponentsFromRegistry } from './delphineGrapesBridge.js';
//import { ResolvedForm } from '../extension/loadForm';

/*
export async function updateFormSourceFiles(form: ResolvedForm, html: string, css: string): Promise<void> {
        const htmlDoc = await vscode.workspace.openTextDocument(form.htmlUri);
        const cssDoc = await vscode.workspace.openTextDocument(form.cssUri);

        const edit = new vscode.WorkspaceEdit();

        const fullHtmlRange = new vscode.Range(htmlDoc.positionAt(0), htmlDoc.positionAt(htmlDoc.getText().length));

        const fullCssRange = new vscode.Range(cssDoc.positionAt(0), cssDoc.positionAt(cssDoc.getText().length));

        edit.replace(form.htmlUri, fullHtmlRange, html);
        edit.replace(form.cssUri, fullCssRange, css);

        await vscode.workspace.applyEdit(edit);

        await htmlDoc.save();
        await cssDoc.save();
}
        */

/*

declare function acquireVsCodeApi(): {
        postMessage(message: unknown): void;
        getState(): unknown;
        setState(state: unknown): void;
};
*/

type DelphineInboundMessage =
        | {
                  type: 'doc:update';
                  html: string;
                  css: string;
          }
        | {
                  type: 'log';
                  text: string;
          };

type DelphineWindow = Window &
        typeof globalThis & {
                __delphineReceiveFromHost?: (payload: DelphineInboundMessage) => void;
                __delphinePendingFromHost?: DelphineInboundMessage[];
        };

const bootInstanceId = Math.random().toString(36).slice(2, 8);

console.log(`[boot ${bootInstanceId}] script evaluated`);
console.log(`[boot ${bootInstanceId}] top? ${window.top === window}`);
console.log(`[boot ${bootInstanceId}] parent===self? ${window.parent === window}`);
//console.log(`[boot ${bootInstanceId}] typeof acquireVsCodeApi = ${typeof acquireVsCodeApi}`);
console.log(`[boot ${bootInstanceId}] location = ${window.location.href}`);

let messageHandler: ((payload: DelphineInboundMessage) => void) | undefined;
const pendingMessages: DelphineInboundMessage[] = [];
//let vscodeApi: ReturnType<typeof acquireVsCodeApi> | null = null;

type DocUpdateMessage = {
        type: 'doc:update';
        html?: string;
        css?: string;
};

function postToVsCode(payload: unknown): void {
        console.log(`[boot ${bootInstanceId}] postToVsCode payload =`, payload);

        window.postMessage(
                {
                        __delphineFromChild: true,
                        payload
                },
                '*'
        );
}

function log(text: string): void {
        console.log(`[boot ${bootInstanceId}] ${text}`);
        postToVsCode({
                type: 'log',
                text: `[boot] ${text}`
        });
}

function extractPayload(event: MessageEvent): DelphineInboundMessage | undefined {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') {
                return undefined;
        }

        if (msg.__delphineFromParent === true) {
                return msg.payload as DelphineInboundMessage;
        }

        if (typeof msg.type === 'string') {
                return msg as DelphineInboundMessage;
        }

        return undefined;
}

function installDirectHostReceiver(): void {
        const w = window as DelphineWindow;

        w.__delphineReceiveFromHost = (payload: DelphineInboundMessage) => {
                console.log(`[boot ${bootInstanceId}] direct message from host: ${payload.type}`);

                if (!messageHandler) {
                        if (!w.__delphinePendingFromHost) {
                                w.__delphinePendingFromHost = [];
                        }
                        w.__delphinePendingFromHost.push(payload);
                        console.log(`[boot ${bootInstanceId}] queued before editor ready: ${payload.type}`);
                        return;
                }

                messageHandler(payload);
        };
}

function flushPendingDirectMessages(): void {
        const w = window as DelphineWindow;
        const pending = w.__delphinePendingFromHost ?? [];

        while (pending.length > 0) {
                const payload = pending.shift();
                if (payload && messageHandler) {
                        messageHandler(payload);
                }
        }
}

async function waitForGrapesJs(): Promise<any> {
        for (let i = 0; i < 100; i++) {
                const grapes = (window as any).grapesjs;
                if (grapes) {
                        return grapes;
                }
                await new Promise((resolve) => setTimeout(resolve, 50));
        }

        throw new Error('grapesjs not available');
}
let rev = 0;
let suppressOutbound = 0;

function beginRemoteApply() {
        suppressOutbound++;
}

function endRemoteApply() {
        window.setTimeout(() => {
                suppressOutbound = Math.max(0, suppressOutbound - 1);
        }, 0);
}

function canSendOutbound(): boolean {
        return suppressOutbound === 0;
}

function postContentChanged(editor: any) {
        if (!canSendOutbound()) {
                return;
        }

        const html = editor.getHtml();
        const css = editor.getCss();

        console.log(`[boot ${bootInstanceId}] contentChanged -> VSCode`);

        postToVsCode({
                type: 'contentChanged',
                html,
                css,
                rev: ++rev
        });
}

function grapesJSEditor(grapes: any): void {
        const editor = grapes.init({
                container: '#gjs',
                height: '100vh',
                storageManager: false
        });

        let dirtyTimer: number | undefined;

        function markDirty(_editor: any, reason: string) {
                if (!canSendOutbound()) {
                        return;
                }

                log(`markDirty ${reason}`);

                if (dirtyTimer !== undefined) {
                        window.clearTimeout(dirtyTimer);
                }

                dirtyTimer = window.setTimeout(() => {
                        dirtyTimer = undefined;
                        postContentChanged(editor);
                }, 150);
        }

        function applyDelphineBodyTraits(): void {
                const wrapper = editor.getWrapper?.();
                if (!wrapper) {
                        return;
                }

                const attrs = wrapper.getAttributes?.() ?? {};
                wrapper.setAttributes?.({
                        ...attrs,
                        'data-delphine-component': 'TForm'
                });
        }

        function loadDocument(html: string, css: string): void {
                log('doc:update <- VSCode');
                log('Document changed will be processed by bootEditor');

                beginRemoteApply();

                try {
                        editor.DomComponents.clear();
                        editor.CssComposer.clear();

                        editor.setComponents(html || '');
                        editor.setStyle(css || '');
                        applyDelphineBodyTraits();

                        console.log(`[boot ${bootInstanceId}] doc updated from VSCode, html length = ${html.length}, css length = ${css.length}`);
                } finally {
                        requestAnimationFrame(() => {
                                log('Document changed has been processed by bootEditor');
                                endRemoteApply();
                        });
                }
        }

        messageHandler = async (payload: DelphineInboundMessage) => {
                switch (payload.type) {
                        case 'doc:update': {
                                const msg = payload as DocUpdateMessage;
                                loadDocument(msg.html ?? '', msg.css ?? '');
                                break;
                        }

                        case 'log':
                                break;

                        //default:
                        //console.log(`[boot ${bootInstanceId}] ignored message type=${payload.type}`);
                        //break;
                }
        };

        const typeRegistry = new TTypeRegistry();
        registerBuiltins(typeRegistry);
        registerDelphineComponentsFromRegistry(editor, typeRegistry);
        flushPendingDirectMessages();

        editor.on('component:update', () => {
                markDirty(editor, 'component:update');
        });

        editor.on('component:add', () => {
                markDirty(editor, 'component:add');
        });

        editor.on('component:remove', () => {
                markDirty(editor, 'component:remove');
        });

        editor.on('style:update', () => {
                markDirty(editor, 'style:update');
        });

        applyDelphineBodyTraits();
}

async function main(): Promise<void> {
        log('bootEditor:loaded');

        try {
                const grapes = await waitForGrapesJs();
                grapesJSEditor(grapes);
                log('GrapesJS ready');
                log('bootEditor:ready -> VSCode');
                installDirectHostReceiver();
                postToVsCode({ type: 'bootEditor:ready' });
        } catch (e) {
                console.error(`[boot ${bootInstanceId}] FAIL`, e);
                postToVsCode({
                        type: 'log',
                        text: `[boot] FAIL ${String((e as any)?.message ?? e)}`
                });
        }
}

if ((window as any).__delphineBootEditorStarted) {
        console.warn(`[boot ${bootInstanceId}] bootEditor already started`);
} else {
        (window as any).__delphineBootEditorStarted = true;

        if (document.readyState === 'loading') {
                document.addEventListener(
                        'DOMContentLoaded',
                        () => {
                                void main();
                        },
                        { once: true }
                );
        } else {
                void main();
        }
}

export {};
