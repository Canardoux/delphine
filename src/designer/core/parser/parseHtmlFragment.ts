// designer/core/parser/parseHtmlFragment.ts

import type { ComponentMetadata, ComponentPropertyMetadata, TDesignRegistry } from '../metadata';

import type { DelphineDocument, DelphineNode, DelphinePropertyValue } from '../model';

import { createDelphineDocument, createDelphineNode } from '../model';

import { loadHtmlFragment, requiredAttribute } from '../html/htmlUtil';

export interface ParseHtmlFragmentOptions {
        frameName: string;
        frameType?: string;
        designRegistry: TDesignRegistry;
}

function parseFrameEvents(element: Element): Record<string, string> {
        const events: Record<string, string> = {};

        const onCreate = element.getAttribute('data-delphine-oncreate')?.trim();

        if (onCreate) {
                events.oncreate = onCreate;
        }

        return events;
}

export function parseHtmlFragment(source: string, options: ParseHtmlFragmentOptions): DelphineDocument {
        const fragment = loadHtmlFragment(source);

        const rootElements = Array.from(fragment.children);

        if (rootElements.length !== 1) {
                throw new Error('A Delphine layout must contain exactly one root <delphine-frame> element.');
        }

        const frameElement = rootElements[0];

        if (frameElement.localName !== 'delphine-frame') {
                throw new Error(`Expected root <delphine-frame>, found <${frameElement.localName}>.`);
        }

        const document = createDelphineDocument({
                frameName: options.frameName,
                frameType: options.frameType
        });

        document.root.name = requiredAttribute(frameElement, 'data-delphine-name');

        document.root.events = parseFrameEvents(frameElement);

        for (const child of Array.from(frameElement.children)) {
                document.root.children.push(...parseElement(child, options.designRegistry));
        }

        return document;
}

/**
 * Parse an element and return every Delphine node found at this level.
 *
 * Ordinary HTML elements are transparent: they are not represented in the
 * Delphine model, but their descendants are still inspected.
 */
function parseElement(element: Element, designRegistry: TDesignRegistry): DelphineNode[] {
        const metadata = designRegistry.findByTag(element.localName);

        if (metadata) {
                return [parseDelphineNode(element, metadata, designRegistry)];
        }

        /*
         * An explicitly marked component must be known by the registry.
         * This catches missing metadata and spelling errors.
         */
        if (element.hasAttribute('data-delphine-component')) {
                const declaredType = element.getAttribute('data-delphine-component');

                throw new Error(`Unknown Delphine component <${element.localName}>` + ` declared as "${declaredType}".`);
        }

        /*
         * Ordinary HTML is ignored, but known Delphine components nested
         * inside it are preserved.
         */
        const nodes: DelphineNode[] = [];

        for (const child of Array.from(element.children)) {
                nodes.push(...parseElement(child, designRegistry));
        }

        return nodes;
}

function parseDelphineNode(element: Element, metadata: ComponentMetadata, designRegistry: TDesignRegistry): DelphineNode {
        const resolvedMetadata = designRegistry.getResolvedMetadata(metadata.type);

        const name = requiredAttribute(element, 'data-delphine-name');

        const node = createDelphineNode({
                type: metadata.type,
                name,

                properties: parseProperties(element, resolvedMetadata),

                events: parseEvents(element, resolvedMetadata)
        });

        /*
         * Ordinary HTML wrappers below a Delphine component are transparent.
         * Delphine descendants found inside them become children of this node.
         */
        for (const child of Array.from(element.children)) {
                node.children.push(...parseElement(child, designRegistry));
        }

        return node;
}

function parseEvents(element: Element, metadata: ComponentMetadata): Record<string, string> {
        const events: Record<string, string> = {};

        for (const event of metadata.events) {
                const attributeName = `data-delphine-${event.name}`;

                const handlerName = element.getAttribute(attributeName);

                if (handlerName === null) {
                        continue;
                }

                const trimmedHandlerName = handlerName.trim();

                if (trimmedHandlerName === '') {
                        continue;
                }

                events[event.name] = trimmedHandlerName;
        }

        return events;
}

function parseProperties(element: Element, metadata: ComponentMetadata): Record<string, DelphinePropertyValue> {
        const result: Record<string, DelphinePropertyValue> = {};

        for (const property of metadata.properties) {
                const rawValue = element.getAttribute(property.name);

                if (rawValue === null) {
                        continue;
                }

                result[property.name] = parsePropertyValue(rawValue, property);
        }

        return result;
}

function parsePropertyValue(value: string, metadata: ComponentPropertyMetadata): DelphinePropertyValue {
        switch (metadata.type) {
                case 'string':
                        return value;

                case 'number': {
                        const number = Number(value);

                        if (!Number.isFinite(number)) {
                                throw new Error(`Invalid number "${value}" ` + `for property "${metadata.name}".`);
                        }

                        return number;
                }

                case 'boolean':
                        if (value === 'true') {
                                return true;
                        }

                        if (value === 'false') {
                                return false;
                        }

                        throw new Error(`Invalid boolean "${value}" ` + `for property "${metadata.name}".`);
        }
}
