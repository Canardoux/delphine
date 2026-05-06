import { TTypeRegistry } from '../vcl/TypeRegistry.js';
import { registerBuiltins } from '../vcl/RegisterVcl.js';
import { registerDelphineComponentsFromRegistry, showDelphineTraitTab, showCurrentDelphineTraitTab } from './delphineGrapesBridge.js';

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
          }
        | {
                  type: 'delphine:theme';
                  theme: string;
                  themeCss: string;
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

function postToVsCode(payload: any): void {
        window.parent.postMessage(
                {
                        __delphineFromChild: true,
                        payload
                },
                '*'
        );
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
                        <option value="win95">Windows 95</option>
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

function grapesJSEditor(grapes: any): void {
        const editor = grapes.init({
                container: '#gjs',
                height: '100vh',
                storageManager: false
        });
        (globalThis as any).editor = editor;

        registerDelphineCommands(editor);
        registerDelphineEventTrait(editor);
        //addThemeSelector(editor);

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
        function applyThemeToDesigner(editor: any, themeName: string, themeCss: string): void {
                const frame = editor.Canvas.getFrameEl();
                const doc = frame?.contentDocument || frame?.contentWindow?.document;
                if (!doc) return;

                const styleId = 'delphine-current-theme';

                let styleEl = doc.getElementById(styleId) as HTMLStyleElement | null;

                if (!styleEl) {
                        styleEl = doc.createElement('style');
                        styleEl!.id = styleId;
                        styleEl!.setAttribute('data-delphine-theme', themeName);
                }

                styleEl!.textContent = themeCss;

                // Keep theme last
                doc.head.appendChild(styleEl);

                console.log('[Delphine] theme CSS injected', themeName, themeCss.length);
        }
        // function applyThemeToDesigner(editor: any, theme: string): void {
        //         const frame = editor.Canvas.getFrameEl();
        //         const doc = frame?.contentDocument;
        //         if (!doc) return;

        //         const themeId = 'delphine-current-theme';

        //         let link = doc.getElementById(themeId) as HTMLLinkElement | null;

        //         if (!link) {
        //                 link = doc.createElement('link');
        //                 link!.id = themeId;
        //                 link!.rel = 'stylesheet';
        //         }

        //         link!.href = `/themes/${theme}.css`;
        //         link!.setAttribute('data-delphine-theme', theme);

        //         doc.head.appendChild(link);
        // }

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
        let currentThemeCss = '';
        let currentThemeName = 'win95';
        messageHandler = async (payload: DelphineInboundMessage) => {
                switch (payload.type) {
                        case 'doc:update': {
                                const msg = payload as DocUpdateMessage;
                                loadDocument(msg.html ?? '', msg.css ?? '');

                                requestAnimationFrame(() => {
                                        if (currentThemeCss) {
                                                applyThemeToDesigner(editor, currentThemeName, currentThemeCss);
                                        }
                                });

                                break;
                        }

                        case 'log':
                                break;

                        case 'delphine:select-component':
                                selectComponentByName(editor, payload.componentName);
                                break;

                        case 'delphine:theme':
                                currentThemeName = payload.theme ?? 'flat';
                                currentThemeCss = payload.themeCss ?? '';

                                const select = document.querySelector('#delphine-theme-selector select') as HTMLSelectElement | null;
                                if (select) {
                                        select.value = currentThemeName;
                                }

                                applyThemeToDesigner(editor, currentThemeName, currentThemeCss);
                                break;
                }
        };

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
                openEventHandler(editor, model, eventName);

                /*
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
                */
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

        const typeRegistry = new TTypeRegistry();
        registerBuiltins(typeRegistry);
        registerDelphineComponentsFromRegistry(editor, typeRegistry);
        flushPendingDirectMessages();

        editor.on('component:update', () => {
                markDirty(editor, 'component:update');
        });

        /*
        editor.on('component:add', (model: any) => {
                markDirty(editor, 'component:add');
                const attrs = model.getAttributes?.() ?? {};

                if (!attrs['data-delphine-component']) return;

                if (attrs['data-delphine-part']) return;

                if (attrs['data-delphine-name']) return;

                const type = attrs['data-delphine-component'] ?? 'Component';

                const base = type.replace(/^T/, '') || 'Component';

                const name = generateUniqueName(editor, base);

                model.setAttributes({
                        ...attrs,

                        name: name
                });

                // Optional: only for Layer Manager display.

                // Do NOT use "name" if it is also a Delphine prop.

                //model.set('delphineDisplayName', `${name}(${type})`, { silent: true });
        });
        */

        editor.on('component:add', (model: any) => {
                markDirty(editor, 'component:add');

                setTimeout(() => {
                        assignNameIfMissing(editor, model);
                        const attrs = model.getAttributes?.() ?? {};

                        if (attrs['data-delphine-component'] && !attrs['data-delphine-part']) {
                                editor.select(model);
                                //openDefaultEventHandler(editor, model);
                        }
                }, 0);
        });

        editor.on('component:remove', () => {
                markDirty(editor, 'component:remove');
        });

        editor.on('style:update', () => {
                markDirty(editor, 'style:update');
        });

        // editor.on('component:selected', (model: any) => {
        //         const attrs = model.getAttributes?.() ?? {};

        //         if (attrs['data-delphine-part']) {
        //                 const parent = model.parent?.();

        //                 if (parent) {
        //                         setTimeout(() => {
        //                                 editor.select(parent);
        //                         }, 0);
        //                 }

        //                 return;
        //         }

        //         showCurrentDelphineTraitTab(editor, model);

        //         if (!isSelectingFromHost) {
        //                 postToVsCode({
        //                         type: 'delphine:designer-selection-changed',
        //                         componentName: attrs['data-delphine-name'],
        //                         componentClass: attrs['data-delphine-component']
        //                 });
        //         }
        // });

        //editor.on('component:selected', (model: any) => {
        // optionnel : garder sélection courante
        //});

        let lastSelection: string | undefined;

        editor.on('component:selected', (model: any) => {
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

                if (currentThemeCss) {
                        applyThemeToDesigner(editor, currentThemeName, currentThemeCss);
                }
        });

        editor.on('load', () => {
                addThemeSelector(editor);
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
                postToVsCode({ type: 'delphine:get-theme' });
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
