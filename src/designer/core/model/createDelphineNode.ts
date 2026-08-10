// designer/core/model/createDelphineNode.ts

import type { DelphineNode } from './delphineNode';
import type { DelphinePropertyValue } from './delphinePropertyValue';

export interface CreateDelphineNodeOptions {
        type: string;
        name: string;

        properties?: Record<string, DelphinePropertyValue>;
        events?: Record<string, string>;
        children?: DelphineNode[];
}

/**
 * Creates a valid Delphine node.
 */
export function createDelphineNode(options: CreateDelphineNodeOptions): DelphineNode {
        const type = options.type.trim();
        const name = options.name.trim();

        if (type.length === 0) {
                throw new Error('type must not be empty.');
        }

        if (name.length === 0) {
                throw new Error('name must not be empty.');
        }

        return {
                type,
                name,
                properties: { ...(options.properties ?? {}) },
                events: { ...(options.events ?? {}) },
                children: [...(options.children ?? [])]
        };
}
