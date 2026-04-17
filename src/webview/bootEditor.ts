import grapesjs from 'grapesjs';
import { TTypeRegistry } from '../vcl/TypeRegistry.js';
import { registerBuiltins } from '../vcl/RegisterVcl.js';
import { registerDelphineComponentsFromRegistry } from './delphineGrapesBridge.js';

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
console.log(`[boot ${bootInstanceId}] location = ${window.location.href}`);

let messageHandler: ((payload: DelphineInboundMessage) => void) | undefined;

type DocUpdateMessage = {
        type: 'doc:update';
        html?: string;
        css?: string;
};

let lastSentHtml = '';
let lastSentCss = '';
let isApplyingRemoteDocument = false;

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

function decodeHtmlEntities(text: string): string {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
}

function normalizeDelphinePropsAttributes(html: string): string {
        return html.replace(/\sdata-delphine-props="([\s\S]*?)"/g, (_match, value) => {
                const decoded = decodeHtmlEntities(value).replace(/'/g, '&#39;');
                return ` data-delphine-props='${decoded}'`;
        });
}

function stripSyntheticBody(html: string): string {
        const trimmed = html.trim();
        const match = trimmed.match(/^<body\b[^>]*>([\s\S]*)<\/body>$/i);

        if (match) {
                return match[1]?.trim() ?? '';
        }

        return trimmed;
}

function normalizeEditorHtml(rawHtml: string): string {
        let html = stripSyntheticBody(rawHtml);
        html = normalizeDelphinePropsAttributes(html);
        return html.trim();
}

function normalizeCssDeclarationBlock(block: string): string {
        return block
                .split(';')
                .map((part) => part.trim())
                .filter((part) => part.length > 0)
                .map((part) => {
                        const colonIndex = part.indexOf(':');
                        if (colonIndex < 0) {
                                return part.replace(/\s+/g, ' ');
                        }

                        const property = part.slice(0, colonIndex).trim().toLowerCase();
                        const value = part.slice(colonIndex + 1).trim().replace(/\s+/g, ' ');
                        return `${property}: ${value}`;
                })
                .join('; ');
}

function normalizeEditorCss(rawCss: string): string {
        const css = (rawCss ?? '').trim();
        if (!css) {
                return '';
        }

        const ruleRegex = /([^{}]+)\{([^{}]*)\}/g;
        const seenRules = new Set<string>();
        const normalizedRules: string[] = [];
        let match: RegExpExecArray | null;

        while ((match = ruleRegex.exec(css)) !== null) {
                const selector = match[1]?.trim().replace(/\s+/g, ' ') ?? '';
                const declarations = normalizeCssDeclarationBlock(match[2] ?? '');

                if (!selector || !declarations) {
                        continue;
                }

                const key = `${selector} { ${declarations} }`;
                if (seenRules.has(key)) {
                        continue;
                }

                seenRules.add(key);
                normalizedRules.push(key);
        }

        return normalizedRules.join('\n');
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
        isApplyingRemoteDocument = true;
}

function endRemoteApply() {
        window.setTimeout(() => {
                suppressOutbound = Math.max(0, suppressOutbound - 1);
                if (suppressOutbound === 0) {
                        isApplyingRemoteDocument = false;
                }
        }, 0);
}

function canSendOutbound(): boolean {
        return suppressOutbound === 0 && !isApplyingRemoteDocument;
}

function postContentChanged(editor: any) {
        if (!canSendOutbound()) {
                return;
        }

        const rawHtml = editor.getHtml();
        const html = normalizeEditorHtml(rawHtml);
        const css = normalizeEditorCss(editor.getCss());

        if (html === lastSentHtml && css === lastSentCss) {
                return;
        }

        lastSentHtml = html;
        lastSentCss = css;

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

        function markDirty(_editor: any, _reason: string) {
                if (!canSendOutbound()) {
                        return;
                }

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
                beginRemoteApply();

                try {
                        editor.DomComponents.clear();
                        editor.CssComposer.clear();

                        editor.setComponents(html || '');
                        editor.setStyle(css || '');
                        applyDelphineBodyTraits();

                        lastSentHtml = normalizeEditorHtml(html || '');
                        lastSentCss = normalizeEditorCss(css || '');

                        console.log(`[boot ${bootInstanceId}] doc updated from VSCode, html length = ${html.length}, css length = ${css.length}`);
                } finally {
                        requestAnimationFrame(() => {
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
