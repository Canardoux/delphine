// designer/core/model/delphineDocument.ts

import type { DelphineNode } from './delphineNode';

export interface DelphineDocument {
        /**
         * Model format version.
         *
         * This is the version of DelphineDocument, not the application
         * or framework version.
         */
        version: 1;

        /**
         * Logical name of the edited frame.
         *
         * Example: "MainFrame"
         */
        frameName: string;

        /**
         * Root node of the designed hierarchy.
         *
         * The root normally represents the TLitFrame itself.
         */
        root: DelphineNode;
}
