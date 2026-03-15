import * as vscode from 'vscode';
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

declare function acquireVsCodeApi(): {
        postMessage(message: unknown): void;
        getState(): unknown;
        setState(state: unknown): void;
};

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
const bootInstanceId = Math.random().toString(36).slice(2, 8);

console.log(`[boot ${bootInstanceId}] script evaluated`);
console.log(`[boot ${bootInstanceId}] top? ${window.top === window}`);
console.log(`[boot ${bootInstanceId}] parent===self? ${window.parent === window}`);
console.log(`[boot ${bootInstanceId}] typeof acquireVsCodeApi = ${typeof acquireVsCodeApi}`);
console.log(`[boot ${bootInstanceId}] location = ${window.location.href}`);

let messageHandler: ((payload: DelphineInboundMessage) => void) | undefined;
const pendingMessages: DelphineInboundMessage[] = [];
let vscodeApi: ReturnType<typeof acquireVsCodeApi> | null = null;

type DocUpdateMessage = {
        type: 'doc:update';
        html?: string;
        css?: string;
};

function postToVsCode(payload: unknown): void {
        const vscode = window.__delphineVsCodeApi;

        if (vscode) {
                console.log(`[boot ${bootInstanceId}] postToVsCode via cached api`);
                vscode.postMessage(payload);
                return;
        }

        console.log('[boot] acquireVsCodeApi unavailable, cannot post message');
        //console.log(`[boot ${bootInstanceId}] queue outbound message until bridge ready`);
        //outboundQueue.push(payload);
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

function installInboundMessagePump(): void {
        window.addEventListener('message', (event: MessageEvent) => {
                const payload = extractPayload(event);
                if (!payload) {
                        return;
                }

                console.log(`[boot ${bootInstanceId}] message from VSCode: ${payload.type}`);

                if (!messageHandler) {
                        pendingMessages.push(payload);
                        console.log(`[boot ${bootInstanceId}] queued before editor ready: ${payload.type}`);
                        return;
                }

                messageHandler(payload);
        });
}

function flushPendingMessages(): void {
        if (!messageHandler) {
                return;
        }

        while (pendingMessages.length > 0) {
                const payload = pendingMessages.shift();
                if (!payload) {
                        continue;
                }
                messageHandler(payload);
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

function grapesJSEditor(grapes: any): void {
        const editor = grapes.init({
                container: '#gjs',
                height: '100vh',
                storageManager: false
        });

        let isApplyingFromVscode = false;

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

                isApplyingFromVscode = true;

                editor.DomComponents.clear();
                editor.CssComposer.clear();

                editor.setComponents(html);
                editor.setStyle(css);
                applyDelphineBodyTraits();

                console.log(`[boot ${bootInstanceId}] doc updated from VSCode, html length = ${html.length}, css length = ${css.length}`);

                requestAnimationFrame(() => {
                        log('Document changed has been processed by bootEditor');
                        isApplyingFromVscode = false;
                });
        }

        messageHandler = async (payload: DelphineInboundMessage) => {
                switch (payload.type) {
                        case 'doc:update': {
                                /*
                                const msg = payload as DocUpdateMessage;
                                loadDocument(msg.html ?? '', msg.css ?? '');
                                break;
                                */
                                const msg = payload as DocUpdateMessage;
                                loadDocument(msg.html!, msg.css!);
                                //const form = resolveForm(this.htmlUri);
                                //if (!form) {
                                //throw new Error('Unable to resolve current Delphine Form');
                                //}

                                //await updateFormSourceFiles(form, msg.html!, msg.css!);
                        }

                        default:
                                console.log(`[boot ${bootInstanceId}] ignored message type=${payload.type}`);
                }
        };
        flushPendingMessages();

        editor.on('component:update', () => {
                if (isApplyingFromVscode) {
                        return;
                }
                log('markDirty component:update');
        });

        applyDelphineBodyTraits();
}

async function main(): Promise<void> {
        const href = window.location.href;
        const hasVsCodeApi = typeof acquireVsCodeApi === 'function';
        const isFakeFrame = href.includes('/fake.html');

        console.log(`[boot ${bootInstanceId}] href = ${href}`);
        console.log(`[boot ${bootInstanceId}] hasVsCodeApi = ${hasVsCodeApi}`);
        console.log(`[boot ${bootInstanceId}] has #gjs = ${!!document.getElementById('gjs')}`);

        if (!hasVsCodeApi || isFakeFrame) {
                console.warn(`[boot ${bootInstanceId}] bootEditor aborted in non-host frame`);
                return;
        }

        //vscodeApi = xxxacquireVsCodeApi();

        installInboundMessagePump();

        log('bootEditor:loaded');

        try {
                const grapes = await waitForGrapesJs();
                grapesJSEditor(grapes);
                log('GrapesJS ready');
                log('bootEditor:ready -> VSCode');
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
