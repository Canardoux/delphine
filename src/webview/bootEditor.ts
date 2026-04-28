import { TTypeRegistry } from '../vcl/TypeRegistry.js';
import { registerBuiltins } from '../vcl/RegisterVcl.js';
import { registerDelphineComponentsFromRegistry, showDelphineTraitTab } from './delphineGrapesBridge.js';

type DelphineInboundMessage =
        | {
                  type: 'doc:update';
                  html: string;
                  css: string;
          }
        | {
                  type: 'log';
                  text: string;
          }
        | {
                  type: 'delphine:select-component';
                  componentName: string;
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
let isSelectingFromHost = false;

type DocUpdateMessage = {
        type: 'doc:update';
        html?: string;
        css?: string;
};

let lastSentHtml = '';
let lastSentCss = '';
let isApplyingRemoteDocument = false;

/*
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
        */

function postToVsCode(payload: any): void {
        window.parent.postMessage(
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
                        const value = part
                                .slice(colonIndex + 1)
                                .trim()
                                .replace(/\s+/g, ' ');
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

function installKeyboardShortcuts(): void {
        window.addEventListener('keydown', (event) => {
                const isSave = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
                if (!isSave) {
                        return;
                }

                event.preventDefault();
                event.stopPropagation();

                log('shortcut Ctrl/Cmd+S');
                postToVsCode({ type: 'delphine:save' });
        });
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
        debugger;
        if (!canSendOutbound()) {
                return;
        }

        const rawHtml = editor.getHtml();
        const html = normalizeEditorHtml(rawHtml);
        const css = normalizeEditorCss(editor.getCss());

        console.log(`[boot ${bootInstanceId}] postContentChanged html.length=${html.length} css.length=${css.length}`);
        console.log(`[boot ${bootInstanceId}] sameHtml=${html === lastSentHtml} sameCss=${css === lastSentCss}`);

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

function registerDelphineCommands(editor: any): void {
        editor.Commands.add('delphine:save', {
                run() {
                        log('command delphine:save');
                        postToVsCode({ type: 'delphine:save' });
                }
        });

        editor.Commands.add('delphine:preview', {
                run() {
                        log('command delphine:preview');
                        postToVsCode({ type: 'delphine:preview' });
                }
        });

        editor.Commands.add('delphine:view-source', {
                run() {
                        log('command delphine:view-source');
                        postToVsCode({ type: 'delphine:view-source' });
                }
        });
}

function cssEscape(value: string): string {
        return String(value)
                .replace(/\\/g, '\\\\') // backslash
                .replace(/"/g, '\\"') // double quote
                .replace(/'/g, "\\'") // single quote
                .replace(/\[/g, '\\[')
                .replace(/\]/g, '\\]')
                .replace(/\./g, '\\.')
                .replace(/:/g, '\\:')
                .replace(/#/g, '\\#');
}

function grapesJSEditor(grapes: any): void {
        const editor = grapes.init({
                container: '#gjs',
                height: '100vh',
                storageManager: false
        });
        (globalThis as any).editor = editor;

        registerDelphineCommands(editor);

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

        function getSelectedComponentKey(editor: any): { id?: string; name?: string } | null {
                const selected = editor.getSelected?.();
                if (!selected) {
                        return null;
                }

                const attrs = selected.getAttributes?.() ?? {};
                const id = attrs.id;
                const name = attrs['data-delphine-name'];

                if (!id && !name) {
                        return null;
                }

                return { id, name };
        }

        function findComponentByKey(editor: any, key: { id?: string; name?: string } | null): any | null {
                if (!key) {
                        return null;
                }

                const wrapper = editor.getWrapper?.();
                if (!wrapper) {
                        return null;
                }

                const all = wrapper.find?.('*') ?? [];
                for (const comp of all) {
                        const attrs = comp.getAttributes?.() ?? {};
                        if (key.name && attrs['data-delphine-name'] === key.name) {
                                return comp;
                        }
                        if (key.id && attrs.id === key.id) {
                                return comp;
                        }
                }

                return null;
        }

        function selectComponentByName(editor: any, componentName: string): void {
                if (!componentName) return;

                const found = editor.getWrapper().find(`[data-delphine-name="${cssEscape(componentName)}"]`)[0];

                if (!found) return;

                isSelectingFromHost = true;

                editor.select(found);

                setTimeout(() => {
                        isSelectingFromHost = false;
                }, 0);
        }

        function loadDocument(html: string, css: string): void {
                const selectedKey = getSelectedComponentKey(editor);

                beginRemoteApply();

                try {
                        editor.DomComponents.clear();
                        editor.CssComposer.clear();

                        editor.setComponents(html || '');

                        editor.UndoManager.stop();

                        editor.setComponents(html);
                        editor.setStyle(css);

                        editor.UndoManager.start();
                        editor.UndoManager.clear();

                        editor.setStyle(css || '');
                        applyDelphineBodyTraits();

                        lastSentHtml = html || '';
                        lastSentCss = css || '';

                        const restoredSelection = findComponentByKey(editor, selectedKey);
                        if (restoredSelection) {
                                editor.select(restoredSelection);
                        } else {
                                editor.select(null);
                        }

                        console.log(`[boot ${bootInstanceId}] doc updated from VSCode, html length = ${html.length}, css length = ${css.length}`);
                } finally {
                        requestAnimationFrame(() => {
                                endRemoteApply();
                        });
                }
        }

        messageHandler = async (payload: DelphineInboundMessage) => {
                debugger;
                switch (payload.type) {
                        case 'doc:update': {
                                const msg = payload as DocUpdateMessage;
                                loadDocument(msg.html ?? '', msg.css ?? '');
                                break;
                        }

                        case 'log':
                                break;

                        case 'delphine:select-component':
                                selectComponentByName(editor, payload.componentName);
                                break;
                }
        };

        function openDefaultEventHandler(editor: any, model: any): void {
                debugger;
                if (!model) return;

                const attrs = model.getAttributes?.() ?? {};

                const componentName = attrs['data-delphine-name'];
                const componentClass = attrs['data-delphine-component'];

                if (!componentName || !componentClass) return;

                const eventName = getDefaultEventName(componentClass);
                const attrName = `data-delphine-${eventName}`;

                let handlerName = attrs[attrName];

                if (!handlerName || String(handlerName).trim() === '') {
                        handlerName = `${componentName}_${eventName}`;

                        model.setAttributes({
                                ...attrs,
                                [attrName]: handlerName
                        });
                }

                postToVsCode({
                        type: 'delphine:open-handler',
                        componentName,
                        eventName,
                        handlerName
                });
        }

        function getDefaultEventName(componentClass: string): string {
                switch (componentClass) {
                        case 'TButton':
                        case 'TCheckBox':
                        case 'TLabel':
                        case 'TPanel':
                        case 'TForm':
                        default:
                                return 'onclick';
                }
        }

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

        /*
        editor.on('component:selected', (model: any) => {
                showDelphineTraitTab(editor, model, 'properties');
        });
        */
        editor.on('component:selected', (model: any) => {
                debugger;
                showDelphineTraitTab(editor, model, 'properties');

                const attrs = model.getAttributes?.() ?? {};

                if (!isSelectingFromHost) {
                        postToVsCode({
                                type: 'delphine:designer-selection-changed',

                                componentName: attrs['data-delphine-name'],

                                componentClass: attrs['data-delphine-component']
                        });
                }
        });

        //editor.on('component:selected', (model: any) => {
        // optionnel : garder sélection courante
        //});

        editor.on('load', () => {
                const frame = editor.Canvas.getFrameEl();
                const doc = frame?.contentDocument;

                if (!doc) return;

                doc.addEventListener(
                        'dblclick',
                        (event: MouseEvent) => {
                                const target = event.target as HTMLElement | null;
                                if (!target) return;

                                const root = target.closest('[data-delphine-component]') as HTMLElement | null;
                                if (!root) return;

                                const model = editor.getSelected();

                                if (model) {
                                        openDefaultEventHandler(editor, model);
                                }
                        },
                        true
                );
        });
        /*

        editor.on('component:dblclick', (model: any) => {
                openDefaultEventHandler(editor, model);
        });
        */

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
                installKeyboardShortcuts();
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
(window as any).showDelphineTraitTab = showDelphineTraitTab;

export {};
