// designer/core/serializer/serializeHtmlFragment.ts

import type { TDesignRegistry } from '../metadata';
import type { DelphineDocument, DelphineNode } from '../model';

export interface SerializeHtmlFragmentOptions {
        designRegistry: TDesignRegistry;
}

export function serializeHtmlFragment(document: DelphineDocument, options: SerializeHtmlFragmentOptions): string {
        return document.root.children.map((node) => serializeNode(node, options.designRegistry, 0)).join('\n\n');
}

function serializeNode(node: DelphineNode, designRegistry: TDesignRegistry, level: number): string {
        const metadata = designRegistry.getResolvedMetadata(node.type);

        const indent = '        '.repeat(level);
        const attributeIndent = `${indent}        `;

        const attributes: string[] = [`data-delphine-component="${escapeHtmlAttribute(node.type)}"`, `data-delphine-name="${escapeHtmlAttribute(node.name)}"`];

        for (const property of metadata.properties) {
                const value = node.properties[property.name];

                if (value === undefined) {
                        continue;
                }

                attributes.push(`${property.name}="${escapeHtmlAttribute(String(value))}"`);
        }

        for (const event of metadata.events) {
                const handlerName = node.events[event.name];

                if (!handlerName) {
                        continue;
                }

                attributes.push(`data-delphine-${event.name}="${escapeHtmlAttribute(handlerName)}"`);
        }

        const openingTag = `${indent}<${metadata.tagName}\n` + attributes.map((attribute) => `${attributeIndent}${attribute}`).join('\n') + '>';

        if (node.children.length === 0) {
                return `${openingTag}\n` + `${indent}</${metadata.tagName}>`;
        }

        const children = node.children.map((child) => serializeNode(child, designRegistry, level + 1)).join('\n\n');

        return `${openingTag}\n\n` + `${children}\n\n` + `${indent}</${metadata.tagName}>`;
}

function escapeHtmlAttribute(value: string): string {
        return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
