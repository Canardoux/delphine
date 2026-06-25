import { TApplication } from '@vcl';

const params = new URLSearchParams(window.location.search);
const unitName = params.get('unit') ?? 'MainUnit';
const appName = params.get('app') ?? 'MainApp';

if (!unitName) {
        throw new Error('Missing unit name');
}

type LoadedUnit = {
        module: any;
        html: string;
        css: string;
};

let app: TApplication | undefined;
let currentUnit: any;
let currentLoadedUnit: LoadedUnit | undefined;

function extractTemplateFromDform(source: string): string {
        const match = source.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
        return match ? (match[1] ?? '') : '';
}

function extractStyleFromDform(source: string): string {
        const match = source.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        return match ? (match[1] ?? '') : '';
}

function applyPreviewStyle(unitName: string, cssText: string): void {
        const styleId = `delphine-preview-style-${unitName}`;

        let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
        }

        styleEl.textContent = cssText;
}

function clearPreviewDom(): void {
        document.querySelectorAll('[data-delphine-form-host]').forEach((el) => {
                el.remove();
        });
}

async function tryLoadUnit(unitName: string): Promise<LoadedUnit> {
        const candidateBasePaths = [`/src/forms/${unitName}`, `/src/frames/${unitName}`];

        let lastError: unknown;

        for (const basePath of candidateBasePaths) {
                try {
                        const module = await import(/* @vite-ignore */ `${basePath}.ts`);

                        const response = await fetch(`${basePath}.dform`);
                        if (!response.ok) {
                                throw new Error(`Cannot load ${basePath}.dform`);
                        }

                        const dformText = await response.text();

                        const html = extractTemplateFromDform(dformText);
                        const css = extractStyleFromDform(dformText);

                        return { module, html, css };
                } catch (error) {
                        lastError = error;
                }
        }

        throw lastError ?? new Error(`Unable to load unit ${unitName}`);
}

function mountUnitRoot(host: HTMLElement, unit: any): void {
        if (unit?.elem instanceof HTMLElement) {
                if (unit.elem.parentElement !== host) {
                        host.appendChild(unit.elem);
                }
        }
}

function disposeCurrentUnit(): void {
        if (!currentUnit) {
                return;
        }

        try {
                if (typeof currentUnit.hide === 'function') {
                        currentUnit.hide();
                }
        } catch (e) {
                console.warn('[previewRuntime] hide() failed:', e);
        }

        try {
                if (typeof currentUnit.destroy === 'function') {
                        currentUnit.destroy();
                }
        } catch (e) {
                console.warn('[previewRuntime] destroy() failed:', e);
        }

        currentUnit = undefined;
}
async function renderLoadedUnit(loaded: LoadedUnit) {
        clearPreviewDom();

        disposeCurrentUnit();

        if (app?.mainForm) {
                try {
                        app.mainForm.destroy?.();
                } catch {}
        }

        app = new TApplication(appName);

        // -------------------------------------------------
        // The following calls could be a bad idea !!!
        await app.readConfig();
        await app.registerRuntimeTypes();
        // await app.createAutoForms();
        // await app.initialize();
        // --------------------------------------------------

        const UnitClass = loaded.module.default ?? loaded.module[unitName];
        const unit = new UnitClass(unitName);

        unit.create(loaded.html);
        app.mainForm = unit;

        unit.show();

        currentUnit = unit;
        currentLoadedUnit = loaded;

        applyPreviewStyle(unitName, loaded.css);

        requestAnimationFrame(() => {
                document.body.offsetHeight;
        });
}

function installLiveUpdateListener(): void {
        window.addEventListener('message', (event) => {
                const msg = event.data;
                console.log('[previewRuntime] message received raw =', msg);

                if (!msg || msg.type !== 'doc:update') {
                        return;
                }

                console.log('[previewRuntime] doc:update received', {
                        htmlLength: msg.html?.length ?? 0,
                        cssLength: msg.css?.length ?? 0,
                        hasCurrentLoadedUnit: !!currentLoadedUnit,
                        hasApp: !!app,
                        hasCurrentUnit: !!currentUnit
                });

                if (typeof msg.html !== 'string' || typeof msg.css !== 'string') {
                        console.warn('[previewRuntime] invalid doc:update payload', msg);
                        return;
                }

                if (!currentLoadedUnit) {
                        console.warn('[previewRuntime] doc:update ignored: currentLoadedUnit is undefined');
                        return;
                }

                const updated: LoadedUnit = {
                        ...currentLoadedUnit,
                        html: msg.html,
                        css: msg.css
                };

                console.log('[previewRuntime] before renderLoadedUnit(updated)');

                try {
                        renderLoadedUnit(updated);
                        console.log('[previewRuntime] after renderLoadedUnit(updated)');
                } catch (e) {
                        console.error('[previewRuntime] doc:update render failed:', e);
                }
        });
}

async function main(): Promise<void> {
        debugger;

        installLiveUpdateListener();

        const loaded = await tryLoadUnit(unitName);
        renderLoadedUnit(loaded);
}

void main().catch((e) => {
        console.error('previewRuntime failed:', e);
});
