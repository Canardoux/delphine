// src/designer/grapes/documentToGrapes.ts

import type { DelphineDocument } from '../core/model';
import { serializeHtmlFragment } from '../core/serializer/serializeHtmlFragment';
import type { ComponentMetadata, ComponentPropertyMetadata, TDesignRegistry } from '../core/metadata';

function createTraits(metadata: ComponentMetadata): Record<string, unknown>[] {
        const traits: Record<string, unknown>[] = [];

        for (const property of metadata.properties) {
                if (!property.design) {
                        continue;
                }

                const trait: Record<string, unknown> = {
                        type: property.design.traitType ?? inferTraitType(property),
                        name: property.name,
                        label: property.design.label ?? property.name
                };

                if (property.design.options) {
                        trait.options = property.design.options.map((option) => ({
                                id: option,
                                name: option
                        }));
                }

                traits.push(trait);
        }

        for (const event of metadata.events) {
                traits.push({
                        type: 'delphine-event',
                        name: event.name,
                        label: event.label ?? event.name
                });
        }

        return traits;
}

function inferTraitType(property: ComponentPropertyMetadata): string {
        switch (property.type) {
                case 'boolean':
                        return 'checkbox';

                case 'number':
                        return 'number';

                case 'string':
                        return 'text';
        }
}

// export function loadDocumentIntoGrapes(editor: any, document: DelphineDocument, registry: TDesignRegistry): void {
//         const html = serializeHtmlFragment(document, {
//                 designRegistry: registry
//         });

//         console.log('[Delphine] before clear', editor.getHtml());

//         editor.DomComponents.clear();
//         editor.setComponents(html);

//         console.log('[Delphine] after setComponents', editor.getHtml());

//         const wrapper = editor.getWrapper?.();

//         if (!wrapper) {
//                 throw new Error('GrapesJS wrapper is not available.');
//         }

//         for (const component of getComponentModels(wrapper.components?.())) {
//                 configureTree(component, registry);
//         }

//         console.log('[Delphine] after configureTree', editor.getHtml());
// }

function applyRootToGrapesWrapper(wrapper: any, document: DelphineDocument): void {
        const root = document.root;

        wrapper.set({
                name: root.name ?? document.frameName
        });

        /*
         * Keep Delphine frame properties on the GrapesJS wrapper.
         *
         * The wrapper represents the TFrame instance at design time.
         */
        for (const [name, value] of Object.entries(root.properties)) {
                wrapper.set(name, value);
        }

        /*
         * Keep root events as model properties too.
         */
        for (const [name, handlerName] of Object.entries(root.events)) {
                wrapper.set(name, handlerName);
        }
}

function applyRootPreview(editor: any, document: DelphineDocument): void {
        const canvasDocument = editor.Canvas.getDocument?.();

        if (!canvasDocument?.body) {
                return;
        }

        const body = canvasDocument.body;
        const properties = document.root.properties;
        console.log('[Delphine] APPLY ROOT PREVIEW', properties);

        if (properties.color !== undefined) {
                body.style.color = String(properties.color);
                console.log(
                        '[Delphine] BODY COLOR =',

                        body.style.color
                );
        }

        if (properties.backgroundColor !== undefined) {
                body.style.backgroundColor = String(properties.backgroundColor);
        }
}

export function loadDocumentIntoGrapes(editor: any, document: DelphineDocument, registry: TDesignRegistry): void {
        const html = serializeHtmlFragment(document, {
                designRegistry: registry
        });

        console.log('[Delphine] before clear', editor.getHtml());

        editor.DomComponents.clear();

        editor.setComponents(html);

        console.log('[Delphine] after setComponents', editor.getHtml());

        const wrapper = editor.getWrapper?.();

        if (!wrapper) {
                throw new Error('GrapesJS wrapper is not available.');
        }

        //debugger;

        const components = wrapper.components?.();

        console.log('[TREE] wrapper =', wrapper);
        console.log('[TREE] components =', components);
        console.log('[TREE] models =', components?.models);
        console.log('[TREE] length =', components?.length);

        // for (const component of getComponentModels(components)) {
        //         configureTree(component, registry);
        // }

        const children = wrapper.components?.();

        for (const component of children?.models ?? []) {
                configureTree(component, registry);
        }

        //wrapper.components().reset();
        /*
         * The GrapesJS wrapper represents the Delphine TFrame itself.
         */
        console.log('[Delphine] ROOT PROPERTIES =', document.root.properties);
        applyRootToGrapesWrapper(wrapper, document);

        // for (const child of document.root.children) {
        //         wrapper.append(createGrapesComponent(child, registry));
        // }

        requestAnimationFrame(() => {
                applyRootPreview(editor, document);
        });

        console.log('[Delphine] after configureTree', editor.getHtml());
}

function getComponentModels(value: any): any[] {
        if (!value) {
                return [];
        }

        if (Array.isArray(value)) {
                return value;
        }

        if (Array.isArray(value.models)) {
                return value.models;
        }

        return [value];
}

function applyControlGeometry(component: any): void {
        const attrs = component.getAttributes?.() ?? {};

        const style: Record<string, string> = {
                position: 'absolute'
        };

        if (attrs.left !== undefined) {
                style.left = toCssLength(attrs.left);
        }

        if (attrs.top !== undefined) {
                style.top = toCssLength(attrs.top);
        }

        if (attrs.width !== undefined) {
                style.width = toCssLength(attrs.width);
        }

        if (attrs.height !== undefined) {
                style.height = toCssLength(attrs.height);
        }

        component.setStyle({
                ...component.getStyle(),
                ...style
        });
}

function toCssLength(value: unknown): string {
        const text = String(value).trim();

        if (/^-?\d+(?:\.\d+)?$/.test(text)) {
                return `${text}px`;
        }

        return text;
}

function configureGrapesComponent(component: any, registry: TDesignRegistry): void {
        const attrs = component.getAttributes?.() ?? {};
        const type = attrs['data-delphine-component'];

        if (!type) {
                return;
        }

        const metadata = registry.getResolvedMetadata(type);

        component.set({
                name: attrs['data-delphine-name'] ?? type,
                droppable: metadata.droppable ?? metadata.container ?? false,
                resizable: metadata.resizable ?? false,
                traits: createTraits(metadata)
        });

        applyControlGeometry(component);
}

export function applyDesignPreview(component: any): void {
        //debugger;

        const attrs = component.getAttributes?.() ?? {};
        console.log('[PREVIEW BEFORE]', attrs['data-delphine-name'], component.getStyle());
        const type = attrs['data-delphine-component'];

        if (!type) {
                return;
        }

        /*
         * Fallback caption when the real custom element runtime
         * is not registered in the Canvas.
         */
        const element = component.getEl?.() as HTMLElement | undefined;

        if (element && type === 'TButton' && !element.ownerDocument.defaultView?.customElements.get(element.tagName.toLowerCase())) {
                element.textContent = String(attrs.caption ?? 'Button');
        }
}

function applyDesignPreviewWhenReady(component: any, remainingAttempts = 60): void {
        applyDesignPreview(component);

        if (component.getEl?.()) {
                return;
        }

        if (remainingAttempts <= 0) {
                console.warn('[Delphine] GrapesJS view not available for', component.getAttributes?.());

                return;
        }

        requestAnimationFrame(() => {
                applyDesignPreviewWhenReady(component, remainingAttempts - 1);
        });
}

function configureTree(component: any, registry: TDesignRegistry): void {
        //debugger;
        configureGrapesComponent(component, registry);

        const children = component.components?.();

        for (const child of children?.models ?? []) {
                configureTree(child, registry);
        }

        applyDesignPreviewWhenReady(component);
}
