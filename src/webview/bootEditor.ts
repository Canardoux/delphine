// webview/bootEditor.ts

import { showDelphineTraitTab, showCurrentDelphineTraitTab } from './delphineGrapesBridge.js';
import { TDesignRegistry, initializeDesignRegistry } from '../designer/core/metadata.js';
import type { ComponentEventMetadata } from '../designer/core/metadata.js';
import type { DelphineDocument } from '../designer/core/model/delphineDocument.js';
import { registerGrapesBlocks } from '../designer/grapes/registerGrapesBlocks.js';
import { applyDesignPreview, loadDocumentIntoGrapes } from '../designer/grapes/documentToGrapes.js';
import { parseHtmlFragment } from '../designer/core/parser/parseHtmlFragment.js';

type DelphineInboundMessage =
        | {
                  type: 'doc:update';
                  html: string;
                  css: string;
          }
        // | {
        //           type: 'delphine-document:update';
        //           document: DelphineDocument;
        //           css?: string;
        //   }
        | {
                  type: 'html:update';
                  frameName: string;
                  html: string;
                  css: string;
                  frameProperties: Record<string, string | number | boolean>;
          }
        | {
                  type: 'log';
                  text: string;
          }
        | {
                  type: 'delphine:select-component';
                  componentName: string;
          }
        | {
                  type: 'delphine:theme';
                  theme: string;
                  themeCss: string;
          }
        | {
                  type: 'app:config';
                  config: any;
          };

type DelphineWindow = Window &
        typeof globalThis & {
                __delphineReceiveFromHost?: (payload: DelphineInboundMessage) => void;
                __delphinePendingFromHost?: DelphineInboundMessage[];
        };
interface VsCodeApi {
        postMessage(message: unknown): void;
        getState(): unknown;
        setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VsCodeApi;
// declare global {
//         interface Window {
//                 __delphineDesignerRuntimeUri?: string;
//         }
// }
declare global {
        interface Window {
                __delphineDesignerRuntimeSource?: string;
        }
}

const vscode = acquireVsCodeApi();
const bootInstanceId = Math.random().toString(36).slice(2, 8);

console.log(`[boot ${bootInstanceId}] script evaluated`);
console.log(`[boot ${bootInstanceId}] top? ${window.top === window}`);
console.log(`[boot ${bootInstanceId}] parent===self? ${window.parent === window}`);
console.log(`[boot ${bootInstanceId}] location = ${window.location.href}`);

let messageHandler: ((payload: DelphineInboundMessage) => Promise<void>) | undefined;

let isSelectingFromHost = false;
const designRegistry = new TDesignRegistry();

type DocUpdateMessage = {
        type: 'doc:update';
        html?: string;
        css?: string;
};

type DelphineCanvasWindow = Window & {
        __delphineRegisterRuntimePalettes?: (paletteNames: readonly string[]) => Promise<void>;
};

let currentPaletteNames: readonly string[] = [];
let lastSentHtml = '';
let lastSentCss = '';
let isApplyingRemoteDocument = false;

function postToVsCode(payload: unknown): void {
        vscode.postMessage(payload);
}

async function registerCanvasRuntimePalettes(editor: any, paletteNames: readonly string[]): Promise<void> {
        const register = await waitForCanvasRuntimeRegistration(editor);

        await register(paletteNames);
}

async function waitForCanvasRuntimeRegistration(editor: any): Promise<(paletteNames: readonly string[]) => Promise<void>> {
        for (let attempt = 0; attempt < 20; attempt++) {
                const canvasWindow = editor.Canvas.getWindow?.() as DelphineCanvasWindow | undefined;

                const register = canvasWindow?.__delphineRegisterRuntimePalettes;

                if (typeof register === 'function') {
                        console.log('[Delphine] Canvas runtime bootstrap is ready.');

                        return register.bind(canvasWindow);
                }

                await new Promise<void>((resolve) => {
                        window.setTimeout(resolve, 50);
                });
        }

        throw new Error('Delphine runtime bootstrap did not become available in the GrapesJS Canvas.');
}

function addThemeSelector(_editor: any): void {
        setTimeout(() => {
                const bar = document.querySelector('.gjs-pn-options .gjs-pn-buttons') ?? document.querySelector('.gjs-pn-options');

                if (!bar) {
                        console.warn('[Delphine] options panel not found');
                        return;
                }

                const select = document.createElement('select');
                select.id = 'delphine-theme-selector';
                select.title = 'Theme';

                select.innerHTML = `
                        <option value="flat">Flat</option>
                        <option value="win95">Win 95</option>
                        <option value="win98">Win 98</option>
                        <option value="win7">Win 7</option>
                        <option value="material">Material</option>
                        <option value="motif">Motif</option>
                        <option value="openlook">Open Look</option>
                `;

                select.style.height = '22px';
                select.style.marginLeft = '6px';
                select.style.marginRight = '6px';
                select.style.maxWidth = '120px';

                select.addEventListener('mousedown', (ev) => ev.stopPropagation());
                select.addEventListener('click', (ev) => ev.stopPropagation());

                select.addEventListener('change', () => {
                        postToVsCode({
                                type: 'delphine:set-theme',
                                theme: select.value
                        });
                });

                bar.appendChild(select);
        }, 100);
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

function installHostReceiver(): void {
        window.addEventListener('message', (event: MessageEvent<DelphineInboundMessage>) => {
                const payload = event.data;

                if (!payload || typeof payload.type !== 'string') {
                        return;
                }

                console.log(`[boot ${bootInstanceId}] message from VSCode: ${payload.type}`);

                const handler = messageHandler;

                if (!handler) {
                        console.warn('[Delphine] Message received before handler installation:', payload.type);

                        return;
                }

                void handler(payload).catch((error: unknown) => {
                        console.error(`[Delphine] Failed to process message "${payload.type}".`, error);

                        postToVsCode({
                                type: 'log',
                                text: `[boot] Failed to process "${payload.type}": ` + String(error instanceof Error ? error.message : error)
                        });
                });
        });
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

function openEventHandler(editor: any, model: any, eventName: string): void {
        if (!model) return;

        const attrs = model.getAttributes?.() ?? {};

        const componentName = attrs['data-delphine-name'];
        const componentClass = attrs['data-delphine-component'];

        if (!componentName || !componentClass) return;

        const attrName = `data-delphine-${eventName}`;

        let handlerName = attrs[attrName];

        if (!handlerName || String(handlerName).trim() === '') {
                handlerName = `${componentName}_${eventName}`;

                model.setAttributes({
                        ...attrs,
                        [attrName]: handlerName
                });

                model.set(eventName, handlerName);
        }

        postToVsCode({
                type: 'delphine:open-handler',
                componentName,
                componentClass,
                eventName,
                handlerName
        });
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

function registerDelphinePanels(editor: any): void {
        const viewsPanelId = 'views';

        if (!editor.Panels.getPanel(viewsPanelId)) {
                editor.Panels.addPanel({
                        id: viewsPanelId,
                        buttons: []
                });
        }

        editor.Panels.addButton(viewsPanelId, {
                id: 'delphine-open-style',
                label: 'Style',
                attributes: {
                        title: 'Style'
                },
                command: 'open-sm',
                togglable: true
        });

        editor.Panels.addButton(viewsPanelId, {
                id: 'delphine-open-blocks',
                label: 'Blocks',
                attributes: {
                        title: 'Blocks'
                },

                command: 'open-blocks',
                togglable: true
        });

        editor.Panels.addButton(viewsPanelId, {
                id: 'delphine-open-traits',
                label: 'Traits',
                attributes: {
                        title: 'Properties and events'
                },

                command: 'open-tm',
                togglable: true
        });

        editor.Panels.addButton(viewsPanelId, {
                id: 'delphine-open-layers',
                label: 'Layers',
                attributes: {
                        title: 'Component hierarchy'
                },

                command: 'open-layers',
                togglable: true
        });
}

async function grapesJSEditor(grapes: any): Promise<void> {
        const designerRuntimeSource = window.__delphineDesignerRuntimeSource;

        if (!designerRuntimeSource) {
                throw new Error('Delphine designer runtime source is not available.');
        }

        const editor = grapes.init({
                container: '#gjs',
                height: '100vh',
                storageManager: false,
                avoidInlineStyle: true,

                selectorManager: {
                        componentFirst: true
                }
        });

        (globalThis as any).__delphineEditor = editor;

        registerDelphineCommands(editor);
        registerDelphineEventTrait(editor);
        registerDelphinePanels(editor);
        addThemeSelector(editor);

        let dirtyTimer: number | undefined;
        //let app: TApplication = new TApplication('MainApp');

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

        function loadDelphineDocument(document: DelphineDocument, css: string): void {
                const selectedKey = getSelectedComponentKey(editor);

                beginRemoteApply();

                try {
                        editor.UndoManager.stop();
                        editor.CssComposer.clear();

                        loadDocumentIntoGrapes(editor, document, designRegistry);

                        editor.setStyle(css || '');
                        applyDelphineBodyTraits();

                        editor.UndoManager.start();
                        editor.UndoManager.clear();

                        const restoredSelection = findComponentByKey(editor, selectedKey);

                        editor.select(restoredSelection ?? null);
                } finally {
                        requestAnimationFrame(endRemoteApply);
                }
        }

        function loadDocument(html: string, css: string): void {
                const selectedKey = getSelectedComponentKey(editor);

                beginRemoteApply();

                try {
                        editor.DomComponents.clear();
                        editor.CssComposer.clear();

                        console.log('[Delphine] 1-BEFORE setComponents =', editor.getHtml());
                        editor.setComponents(html || '');
                        console.log('[Delphine] 1-AFTER setComponents =', editor.getHtml());

                        editor.UndoManager.stop();

                        console.log('[Delphine] 2-APPLY DOCUMENT html =', html);
                        console.log('[Delphine] 2-APPLY DOCUMENT css =', css);

                        editor.setComponents(html);

                        console.log('[Delphine] 2-AFTER setComponents =', editor.getHtml());
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

        function loadHtmlIntoGrapes(editor: any, frameName: string, html: string, css: string, frameProperties: Record<string, string | number | boolean>, designRegistry: TDesignRegistry): void {
                const document = parseHtmlFragment(html, {
                        frameName,
                        designRegistry
                });

                /*
                 * Frame property initial values come from the
                 * TypeScript property-values section, not from
                 * <delphine-frame>.
                 */
                Object.assign(document.root.properties, frameProperties);

                console.log('[Delphine] ROOT PROPERTIES BEFORE LOAD =', document.root.properties);

                loadDelphineDocument(document, css);
        }

        function applyThemeToDesigner(editor: any, themeName: string, themeCss: string): void {
                const frame = editor.Canvas.getFrameEl();
                const doc = frame?.contentDocument || frame?.contentWindow?.document;

                if (!doc) {
                        return;
                }

                /*
                 * Activate the theme on the Canvas document.
                 *
                 * Theme styles use selectors such as:
                 *
                 *     :root[data-theme='motif']
                 *
                 * so the attribute belongs on <html>.
                 */
                doc.documentElement.setAttribute('data-theme', themeName);

                const styleId = 'delphine-current-theme';

                let styleEl = doc.getElementById(styleId) as HTMLStyleElement | null;

                if (!styleEl) {
                        styleEl = doc.createElement('style');
                        styleEl!.id = styleId;
                }

                styleEl!.setAttribute('data-delphine-theme', themeName);
                styleEl!.textContent = themeCss;

                /*
                 * Keep the theme after the other document styles.
                 */
                doc.head.appendChild(styleEl);

                console.log('[Delphine] theme CSS injected', themeName, themeCss.length, 'data-theme =', doc.documentElement.getAttribute('data-theme'));
        }

        async function waitForCanvasDocument(editor: any): Promise<Document> {
                for (let attempt = 0; attempt < 50; attempt++) {
                        const frame = editor.Canvas.getFrameEl?.() as HTMLIFrameElement | undefined;

                        const document = frame?.contentDocument;

                        if (document?.head && document?.body) {
                                return document;
                        }

                        await new Promise<void>((resolve) => {
                                window.setTimeout(resolve, 20);
                        });
                }

                throw new Error('The GrapesJS Canvas document did not become available.');
        }

        async function initializeCanvas(editor: any): Promise<void> {
                console.trace('[Delphine] initializeCanvas CALLED');

                console.log(
                        '[Delphine] BEFORE initializeCanvas HTML:',

                        editor.getHtml()
                );
                await installDesignerRuntime(editor, designerRuntimeSource!);

                if (currentPaletteNames.length > 0) {
                        await registerCanvasRuntimePalettes(editor, currentPaletteNames);
                }

                if (currentThemeCss) {
                        applyThemeToDesigner(editor, currentThemeName, currentThemeCss);
                }

                console.log('[Delphine] AFTER initializeCanvas HTML:', editor.getHtml());
        }

        let designerRuntimeBlobUrl: string | undefined;

        function getDesignerRuntimeBlobUrl(runtimeSource: string): string {
                if (!designerRuntimeBlobUrl) {
                        const blob = new Blob(
                                [runtimeSource],

                                {
                                        type: 'text/javascript'
                                }
                        );

                        designerRuntimeBlobUrl = URL.createObjectURL(blob);
                }

                return designerRuntimeBlobUrl;
        }

        async function installDesignerRuntime(editor: any, runtimeSource: string): Promise<void> {
                const document = await waitForCanvasDocument(editor);

                if (document.querySelector('script[data-delphine-runtime]')) {
                        return;
                }

                const runtimeUrl = getDesignerRuntimeBlobUrl(runtimeSource);

                await new Promise<void>((resolve, reject) => {
                        const script = document.createElement('script');

                        script.dataset.delphineRuntime = 'true';
                        script.src = runtimeUrl;

                        script.addEventListener('load', () => resolve(), { once: true });

                        script.addEventListener('error', () => reject(new Error('Unable to load the Delphine runtime in the GrapesJS Canvas.')), { once: true });

                        document.head.appendChild(script);
                });

                console.log('[Delphine] Canvas runtime installed.');
        }

        function registerDelphineEventTrait(editor: any): void {
                editor.TraitManager.addType('delphine-event', {
                        createInput({ trait, component }: any) {
                                const container = document.createElement('div');
                                container.style.display = 'flex';
                                container.style.gap = '4px';

                                const input = document.createElement('input');
                                input.style.flex = '1';

                                const button = document.createElement('button');
                                button.textContent = '⚡';
                                button.title = 'Open handler';
                                button.style.cursor = 'pointer';

                                const eventName = trait.get('name');
                                const attrName = `data-delphine-${eventName}`;
                                const attrs = component.getAttributes?.() ?? {};

                                input.value = attrs[attrName] ?? '';

                                input.addEventListener('change', () => {
                                        const currentAttrs = component.getAttributes?.() ?? {};

                                        component.setAttributes({
                                                ...currentAttrs,
                                                [attrName]: input.value
                                        });

                                        component.set(eventName, input.value);
                                });

                                button.addEventListener('click', () => {
                                        openEventHandler(editor, component, eventName);
                                });

                                // bonus : double click aussi
                                input.addEventListener('dblclick', () => {
                                        openEventHandler(editor, component, eventName);
                                });

                                container.appendChild(input);
                                container.appendChild(button);

                                return container;
                        }
                });
        }

        function findModelFromElement(editor: any, el: HTMLElement): any | null {
                const name = el.getAttribute('data-delphine-name');
                if (!name) return null;

                const found = editor.getWrapper().find(`[data-delphine-name="${cssEscape(name)}"]`)[0];

                return found ?? null;
        }

        function generateUniqueName(editor: any, base: string): string {
                const wrapper = editor.getWrapper();
                const all = wrapper.find('[data-delphine-name]');

                const existing = new Set(all.map((c: any) => c.getAttributes()?.['data-delphine-name']));

                let i = 1;
                let name = `${base}${i}`;

                while (existing.has(name)) {
                        i++;
                        name = `${base}${i}`;
                }

                return name;
        }

        function openDefaultEventHandler(editor: any, model: any): void {
                if (!model) return;

                const attrs = model.getAttributes?.() ?? {};

                const componentName = attrs['data-delphine-name'];
                const componentClass = attrs['data-delphine-component'];

                if (!componentName || !componentClass) return;

                const eventName = getDefaultEventName(componentClass);
                if (eventName) openEventHandler(editor, model, eventName);
        }

        // function getDefaultEventName(componentClass: string): string {
        //         switch (componentClass) {
        //                 case 'TButton':
        //                 case 'TCheckBox':
        //                 case 'TLabel':
        //                 case 'TPanel':
        //                 case 'TForm':
        //                 default:
        //                         return 'onclick';
        //         }
        // }

        function getDefaultEventName(componentClass: string): string | undefined {
                const metadata = designRegistry.getResolvedMetadata(componentClass);

                return metadata.events.find((event) => event.default)?.name;
        }

        function isValidUniqueName(editor: any, model: any, name: string): boolean {
                if (!name) return false;

                const wrapper = editor.getWrapper();
                const all = wrapper.find('[data-delphine-name]');

                for (const comp of all) {
                        if (comp === model) continue;

                        const other = comp.getAttributes?.()['data-delphine-name'];
                        if (other === name) return false;
                }

                return true;
        }
        function isLoadingRemoteDocument(): boolean {
                return suppressOutbound > 0 || isApplyingRemoteDocument;
        }
        function assignNameIfMissing(editor: any, model: any): void {
                if ((model as any).__delphineNameAssigned) return;

                if (!model.getEl?.()) return;

                const attrs = model.getAttributes?.() ?? {};

                const type = attrs['data-delphine-component'];
                if (!type) return;

                if (attrs['data-delphine-part']) return;

                let name = attrs['data-delphine-name'];

                if (!isValidUniqueName(editor, model, name)) {
                        const base = type.replace(/^T/, '') || 'Component';
                        name = generateUniqueName(editor, base);

                        model.setAttributes({
                                ...attrs,
                                'data-delphine-name': name
                        });
                        (model as any).__delphineSyncingName = true;
                        try {
                                model.set('name', name, { silent: true });
                        } finally {
                                (model as any).__delphineSyncingName = false;
                        }
                }

                (model as any).__delphineNameAssigned = true;
        }

        function removeGeneratedGrapesClasses(component: any) {
                const classes = component.getClasses();

                for (const cls of classes) {
                        if (/^c\d+$/.test(cls)) {
                                component.removeClass(cls);
                        }
                }
        }

        //const app = new TApplication('AppForGrapesJS');
        //await app.readConfig(); !!! ne marche pas, car on ne peut pas faire d'import dynamique dans un module ESM
        // const typeRegistry = new TTypeRegistry();
        // await registerPalettes(typeRegistry!, allPalettes);
        //await app.registerFrames(typeRegistry!);

        // const app = getApplication() as TApplication;
        // await registerFrames(typeRegistry);
        // registerDelphineComponentsFromRegistry(editor, typeRegistry!);
        // keepTypeRegistry(typeRegistry!);

        //await registerDesignPalettes(designRegistry, appConfig.palettes); // TODO:

        // function createTestDocument(): DelphineDocument {
        //         return {
        //                 version: 1,
        //                 frameName: 'MainFrame',

        //                 root: {
        //                         type: 'MainFrame',
        //                         name: 'MainFrame',
        //                         properties: {},
        //                         events: {},

        //                         children: [
        //                                 {
        //                                         type: 'TPanel',
        //                                         name: 'Panel1',

        //                                         properties: {
        //                                                 left: 10,
        //                                                 top: 10,
        //                                                 width: '320',
        //                                                 height: '180'
        //                                         },

        //                                         events: {},

        //                                         children: [
        //                                                 {
        //                                                         type: 'TButton',
        //                                                         name: 'Button1',

        //                                                         properties: {
        //                                                                 left: 10,
        //                                                                 top: 10,
        //                                                                 caption: 'Hello from Delphine',
        //                                                                 enabled: true
        //                                                         },

        //                                                         events: {
        //                                                                 onclick: 'Button1Click'
        //                                                         },

        //                                                         children: []
        //                                                 }
        //                                         ]
        //                                 }
        //                         ]
        //                 }
        //         };
        // }
        let currentThemeCss = '';
        let currentThemeName = 'win98';
        messageHandler = async (payload: DelphineInboundMessage) => {
                switch (payload.type) {
                        case 'doc:update': {
                                console.log('[Delphine] DOC UPDATE RECEIVED', payload.html);
                                const msg = payload as DocUpdateMessage;
                                loadDocument(msg.html ?? '', msg.css ?? '');
                                requestAnimationFrame(() => {
                                        if (currentThemeCss) {
                                                applyThemeToDesigner(editor, currentThemeName, currentThemeCss);
                                        }
                                });
                                editor.refresh();

                                break;
                        }

                        // case 'delphine-document:update': {
                        //         loadDelphineDocument(payload.document, payload.css ?? '');

                        //         requestAnimationFrame(() => {
                        //                 if (currentThemeCss) {
                        //                         applyThemeToDesigner(editor, currentThemeName, currentThemeCss);
                        //                 }

                        //                 editor.refresh();
                        //         });

                        //         break;
                        // }

                        case 'log':
                                break;

                        case 'delphine:select-component': {
                                const componentName = payload.componentName;

                                console.log('[select] requested =', componentName);

                                const all = editor.DomComponents.getWrapper().find('[data-delphine-name]');

                                console.log('[select] candidates =', all.length);

                                for (const cmp of all) {
                                        const name = cmp.getAttributes()['data-delphine-name'];

                                        console.log('[select] candidate =', name);

                                        if (name === componentName) {
                                                console.log('[select] FOUND');

                                                editor.select(cmp);
                                                return;
                                        }
                                }

                                console.warn('[select] NOT FOUND:', componentName);
                                break;
                        }
                        case 'delphine:theme': {
                                currentThemeName = payload.theme ?? 'flat';
                                currentThemeCss = payload.themeCss ?? '';

                                const select = document.querySelector('#delphine-theme-selector') as HTMLSelectElement | null;
                                if (select) {
                                        select.value = currentThemeName;
                                }

                                applyThemeToDesigner(editor, currentThemeName, currentThemeCss);
                                break;
                        }
                        // case 'app:config': {
                        //         const config = payload.config;
                        //         const paletteNames: readonly string[] = config.palettes ?? [];

                        //         console.log('[Delphine] app:config received', config);

                        //         await initializeDesignRegistry(designRegistry, paletteNames);

                        //         console.log('[Delphine] design types registered', designRegistry.getAll());

                        //         registerGrapesBlocks(editor, designRegistry);

                        //         editor.BlockManager.render?.();

                        //         const testDocument = createTestDocument();

                        //         beginRemoteApply();

                        //         try {
                        //                 editor.UndoManager.stop();

                        //                 loadDocumentIntoGrapes(editor, testDocument, designRegistry);

                        //                 applyDelphineBodyTraits();

                        //                 editor.UndoManager.start();
                        //                 editor.UndoManager.clear();

                        //                 editor.refresh();
                        //         } finally {
                        //                 requestAnimationFrame(() => {
                        //                         endRemoteApply();
                        //                 });
                        //         }

                        //         /*
                        //          * Runtime registration is optional and must not delay
                        //          * the design-time preview.
                        //          */
                        //         void registerCanvasRuntimePalettes(editor, paletteNames).catch((error: unknown) => {
                        //                 console.warn('[Delphine] Canvas runtime is unavailable; ' + 'using design previews.', error);
                        //         });

                        //         editor.BlockManager.render?.();

                        //         break;
                        // }

                        case 'app:config': {
                                currentPaletteNames = payload.config.palettes ?? [];

                                await initializeDesignRegistry(designRegistry, currentPaletteNames);

                                registerGrapesBlocks(editor, designRegistry);
                                editor.BlockManager.render?.();

                                //await initializeCanvas(editor);
                                // {
                                //         // TODO:
                                //         editor.setComponents(`
                                //                 <div id="delphine-probe">
                                //                         HELLO DELPHINE
                                //                 </div>
                                //         `);

                                //         console.log('[PROBE] editor.getHtml() =', editor.getHtml());

                                //         console.log('[PROBE] canvas body =', editor.Canvas.getDocument?.()?.body?.innerHTML);
                                //         postToVsCode({
                                //                 type: 'log',
                                //                 text: '[PROBE] getHtml=' + editor.getHtml() + ' BODY=' + editor.Canvas.getDocument?.()?.body?.innerHTML
                                //         });
                                // }

                                /*
                                 * Ask the host for the application theme once
                                 * the Canvas is operational.
                                 */
                                postToVsCode({
                                        type: 'delphine:get-theme'
                                });

                                postToVsCode({
                                        type: 'delphine:design-ready'
                                });

                                break;
                        }

                        case 'html:update': {
                                //debugger;
                                console.log('[HTML UPDATE] RAW length =', payload.html.length);
                                console.log('[HTML UPDATE] RAW =', payload.html);

                                loadHtmlIntoGrapes(editor, payload.frameName, payload.html, payload.css, payload.frameProperties, designRegistry);

                                console.log('[HTML UPDATE] editor.getHtml() =', editor.getHtml());

                                requestAnimationFrame(() => {
                                        const canvasDocument = editor.Canvas.getDocument?.();

                                        console.log('[HTML UPDATE] canvas body =', canvasDocument?.body?.innerHTML);

                                        console.log('[HTML UPDATE] wrapper components =', editor.getWrapper?.()?.components?.()?.length);
                                });

                                break;
                        }

                        // case 'delphine-document:update': {
                        //         loadDelphineDocument(payload.document, payload.css ?? '');

                        //         requestAnimationFrame(() => {
                        //                 if (currentThemeCss) {
                        //                         applyThemeToDesigner(editor, currentThemeName, currentThemeCss);
                        //                 }

                        //                 editor.refresh();
                        //         });

                        //         break;
                        // }
                }
        };

        flushPendingDirectMessages();

        editor.on('component:update', () => {
                markDirty(editor, 'component:update');
        });

        editor.on('component:add', (model: any) => {
                if (isLoadingRemoteDocument()) {
                        return;
                }

                markDirty(editor, 'component:add');

                setTimeout(() => {
                        if (isLoadingRemoteDocument()) {
                                return;
                        }

                        assignNameIfMissing(editor, model);

                        const attrs = model.getAttributes?.() ?? {};

                        if (attrs['data-delphine-component'] && !attrs['data-delphine-part']) {
                                editor.select(model);
                        }
                }, 0);
        });

        editor.on('component:remove', (component: any) => {
                console.log(
                        '[Delphine] component removed',

                        component?.getAttributes?.(),

                        new Error().stack
                );

                markDirty(editor, 'component:remove');
        });

        editor.on('style:update', () => {
                markDirty(editor, 'style:update');
        });

        let lastSelection: string | undefined;
        console.log('### THIS IS THE CURRENT bootEditor.ts ###');

        editor.on('component:selected', (model: any) => {
                console.log('### COMPONENT SELECTED HANDLER ###', model);
                debugger;

                if (isLoadingRemoteDocument()) {
                        return;
                }
                const attrs = model.getAttributes?.() ?? {};

                const name = attrs['data-delphine-name'];
                const cls = attrs['data-delphine-component'];

                if (attrs['data-delphine-part']) {
                        const parent = model.parent?.();
                        if (parent) {
                                setTimeout(() => editor.select(parent), 0);
                        }
                        return;
                }

                showCurrentDelphineTraitTab(editor, model);

                if (!isSelectingFromHost) {
                        if (name === lastSelection) return; // 🔥 clé

                        lastSelection = name;

                        postToVsCode({
                                type: 'delphine:designer-selection-changed',
                                componentName: name,
                                componentClass: cls
                        });
                }
        });

        editor.on('canvas:frame:load', () => {
                console.log('[Delphine] frame loaded');

                void initializeCanvas(editor).catch((error: unknown) => {
                        console.error('[Delphine] Failed to initialize the Canvas.', error);
                });
        });

        editor.on('load', () => {
                //addThemeSelector(editor);
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

                                const model = findModelFromElement(editor, root);

                                if (model) {
                                        openDefaultEventHandler(editor, model);
                                }
                        },
                        true
                );
                doc.addEventListener(
                        'mousedown',
                        (event: MouseEvent) => {
                                const target = event.target as HTMLElement | null;
                                if (!target) return;

                                const root = target.closest('[data-delphine-component]');
                                if (!root) return;

                                const model = findModelFromElement(editor, root as HTMLElement);
                                if (!model) return;

                                // 🔥 force la sélection du composant racine
                                editor.select(model);

                                event.stopPropagation();
                        },
                        true
                );
                for (const eventName of ['mousedown', 'mouseup', 'click']) {
                        doc.addEventListener(
                                eventName,
                                (event: MouseEvent) => {
                                        const target = event.target as HTMLElement | null;

                                        if (!target) return;

                                        const part = target.closest('[data-delphine-part]');

                                        const root = target.closest('[data-delphine-component]') as HTMLElement | null;

                                        if (!root) return;

                                        // Prevent native checkbox toggle inside the designer

                                        if (part) {
                                                event.preventDefault();

                                                event.stopPropagation();
                                        }

                                        const model = findModelFromElement(editor, root);

                                        if (!model) return;

                                        setTimeout(() => {
                                                editor.select(model);
                                        }, 0);
                                },
                                true
                        );
                }
                //postToVsCode({ type: 'delphine:get-theme' });
        });

        editor.on('component:styleUpdate', (component: any) => {
                removeGeneratedGrapesClasses(component);

                const view = component.view;
                const el = view?.el as HTMLElement | undefined;

                if (!el) return;

                const style = component.getStyle();
                console.log('STYLE UPDATE', component.getStyle());
                debugger;

                // if (style.color !== undefined) {
                //         const attrs = component.getAttributes?.() ?? {};
                //         component.setAttributes({
                //                 ...attrs,
                //                 color: style.color
                //         });
                // }

                if (style.height) {
                        el.style.height = String(style.height);
                }

                if (style.width) {
                        el.style.width = String(style.width);
                }
        });

        editor.on('component:mount', (component: any) => {
                const element = component.getEl?.() as HTMLElement | undefined;

                if (!element) {
                        return;
                }

                const canvasWindow = editor.Canvas.getWindow?.();

                if (!canvasWindow?.customElements.get(element.localName)) {
                        applyDesignPreview(component);
                }
        });

        applyDelphineBodyTraits();

        editor.Panels.addButton('options', {
                id: 'delphine-devtools',
                label: '🐞',
                attributes: { title: 'Open DevTools' },
                command: () => {
                        postToVsCode({ type: 'delphine:devtools' });
                }
        });
        editor.Panels.addButton('options', {
                id: 'delphine-run',
                label: '▶',
                attributes: { title: 'Run App' },
                command: () => {
                        postToVsCode({ type: 'delphine:run-app' });
                }
        });
}

async function main(): Promise<void> {
        log('bootEditor:loaded');

        try {
                const grapes = await waitForGrapesJs();
                await grapesJSEditor(grapes);
                log('GrapesJS ready');
                log('bootEditor:ready -> VSCode');
                //installDirectHostReceiver();
                installHostReceiver();
                installKeyboardShortcuts();
                postToVsCode({ type: 'bootEditor:ready' });
                postToVsCode({ type: 'app:get-config' });
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
