// designer/core/model/delphineNode.ts

import type { DelphinePropertyValue } from './delphinePropertyValue';

export interface DelphineNode {
        /**
         * Stable identifier used internally by the Designer.
         *
         * It must not depend on the component name because a component
         * may be renamed without changing its identity.
         */
        // Probably not necessary for a DelphineNode
        //id: string;

        /**
         * Delphine component class or metaclass name.
         *
         * Examples:
         * - "TLitButton"
         * - "TLitPanel"
         * - "MainFrame"
         */
        type: string;

        /**
         * User-visible component name inside the frame.
         *
         * Examples:
         * - "Button1"
         * - "CustomerPanel"
         */
        name: string;

        attributes: Record<string, string>;

        /**
         * Explicitly assigned property values.
         *
         * Default values should normally remain in the metaclass
         * and should not be duplicated here.
         */
        properties: Record<string, DelphinePropertyValue>;

        /**
         * Maps Delphine event names to handler method names.
         *
         * Example:
         * {
         *     onclick: "Button1Click"
         * }
         */
        events: Record<string, string>;

        /**
         * Child components in visual order.
         */
        children: DelphineNode[];
}
