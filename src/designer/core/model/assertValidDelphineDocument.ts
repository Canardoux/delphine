// designer/core/model/assertValidDelphineDocument.ts

import type { DelphineDocument } from './delphineDocument';
import type { DelphineNode } from './delphineNode';

/**
 * Throws an error when the supplied value is not a valid
 * DelphineDocument version 1.
 */
export function assertValidDelphineDocument(value: unknown): asserts value is DelphineDocument {
        if (!isRecord(value)) {
                throw new Error('The Delphine document must be an object.');
        }

        if (value.version !== 1) {
                throw new Error('Unsupported Delphine document version.');
        }

        if (!isNonEmptyString(value.frameName)) {
                throw new Error('frameName must be a non-empty string.');
        }

        assertValidDelphineNode(value.root, 'root');

        const root = value.root as DelphineNode;

        if (root.name !== value.frameName) {
                throw new Error(`root.name must match frameName: ` + `"${root.name}" !== "${value.frameName}".`);
        }
}

function assertValidDelphineNode(value: unknown, path: string): asserts value is DelphineNode {
        if (!isRecord(value)) {
                throw new Error(`${path} must be an object.`);
        }

        if (!isNonEmptyString(value.type)) {
                throw new Error(`${path}.type must be a non-empty string.`);
        }

        if (!isNonEmptyString(value.name)) {
                throw new Error(`${path}.name must be a non-empty string.`);
        }

        if (!isPropertyMap(value.properties)) {
                throw new Error(`${path}.properties contains an invalid value.`);
        }

        if (!isEventMap(value.events)) {
                throw new Error(`${path}.events contains an invalid value.`);
        }

        if (!Array.isArray(value.children)) {
                throw new Error(`${path}.children must be an array.`);
        }

        value.children.forEach((child, index) => {
                assertValidDelphineNode(child, `${path}.children[${index}]`);
        });
}

function isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
        return typeof value === 'string' && value.trim().length > 0;
}

function isPropertyMap(value: unknown): value is DelphineNode['properties'] {
        if (!isRecord(value)) {
                return false;
        }

        return Object.values(value).every((propertyValue) => propertyValue === null || typeof propertyValue === 'string' || typeof propertyValue === 'number' || typeof propertyValue === 'boolean');
}

function isEventMap(value: unknown): value is DelphineNode['events'] {
        if (!isRecord(value)) {
                return false;
        }

        return Object.values(value).every((handlerName) => typeof handlerName === 'string');
}
