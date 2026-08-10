// designer/core/model/createDelphineDocument.ts

import type { DelphineDocument } from './delphineDocument';
import { createDelphineNode } from './createDelphineNode';

export interface CreateDelphineDocumentOptions {
        frameName: string;
        frameType?: string;
}

/**
 * Creates an empty Delphine document for a frame.
 */
export function createDelphineDocument(options: CreateDelphineDocumentOptions): DelphineDocument {
        const frameName = options.frameName.trim();

        if (frameName.length === 0) {
                throw new Error('frameName must not be empty.');
        }

        const root = createDelphineNode({
                type: options.frameType?.trim() || frameName,
                name: frameName
        });

        return {
                version: 1,
                frameName,
                root
        };
}
