// designer/core/html/htmlUtil.ts

//import { JSDOM } from 'jsdom';

/**
 * Parses an HTML fragment without requiring a browser environment.
 */
export function loadHtmlFragment(source: string): DocumentFragment {
        const template = document.createElement('template');

        template.innerHTML = source.trim();

        return template.content;
}

/**
 * Returns a mandatory non-empty attribute.
 */
export function requiredAttribute(element: Element, name: string): string {
        const value = element.getAttribute(name);

        if (value === null) {
                throw new Error(`Missing required attribute "${name}" on <${element.localName}>.`);
        }

        const trimmedValue = value.trim();

        if (trimmedValue.length === 0) {
                throw new Error(`Attribute "${name}" must not be empty on <${element.localName}>.`);
        }

        return trimmedValue;
}

/**
 * Returns an optional attribute.
 *
 * An explicitly empty attribute remains an empty string.
 */
export function optionalAttribute(element: Element, name: string): string | undefined {
        const value = element.getAttribute(name);

        return value === null ? undefined : value;
}

/**
 * Returns the direct child elements of an element.
 */
export function childElements(element: Element): Element[] {
        return Array.from(element.children);
}
