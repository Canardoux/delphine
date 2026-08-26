// BuildComponentTree.ts
//
import type { IForm } from './IForm';
import { getApplication } from './IApplication';
import { TLitControlElement } from './LitControlElement';

type RegistryLike = {
        registerComponent?: (name: string, el: Element) => void;
        componentRegistry?: Map<string, Element>;
};

type DelphineElement = Element & {
        readonly isDelphineComponent: true;
};

type DelphineFrameElement = DelphineElement &
        RegistryLike & {
                readonly isDelphineFrame: true;
        };

function isDelphineElement(el: Element): el is DelphineElement {
        return (el as Partial<DelphineElement>).isDelphineComponent === true;
}

function isDelphineFrame(el: Element): el is DelphineFrameElement {
        return (el as Partial<DelphineFrameElement>).isDelphineFrame === true;
}

function delphineNameOf(el: Element): string | null {
        return el.getAttribute('data-delphine-name') ?? el.getAttribute('name') ?? null;
}

function registerInFrame(frame: RegistryLike, el: Element): void {
        const name = delphineNameOf(el);
        if (!name) return;

        if (frame.registerComponent) {
                frame.registerComponent(name, el);
                return;
        }

        frame.componentRegistry?.set(name, el);
}

async function waitLitIfNeeded(el: Element): Promise<void> {
        const maybeLit = el as Element & {
                updateComplete?: Promise<unknown>;
        };

        if (maybeLit.updateComplete) {
                await maybeLit.updateComplete;
        }
}

/*
 * Do not filter here.
 *
 * Ordinary HTML elements such as div, section or span may contain
 * Delphine components and must therefore remain traversable.
 */
function directLightChildren(el: Element): Element[] {
        return Array.from(el.children);
}

function directShadowChildren(el: Element): Element[] {
        const root = el.shadowRoot;
        if (!root) return [];

        return Array.from(root.children);
}

function assignedSlotChildren(el: Element): Element[] {
        const root = el.shadowRoot;
        if (!root) return [];

        const result: Element[] = [];

        root.querySelectorAll('slot').forEach((slot) => {
                result.push(...slot.assignedElements({ flatten: true }));
        });

        return result;
}

function directChildren(el: Element): Element[] {
        return [...new Set([...directLightChildren(el), ...assignedSlotChildren(el), ...directShadowChildren(el)])];
}

export class ComponentTreeIndexer {
        async indexFrame(root: Element, frame: RegistryLike): Promise<void> {
                /*
                 * Wait until the root frame has completed its Lit update,
                 * but do not register the root frame in its own registry.
                 */
                await waitLitIfNeeded(root);

                for (const child of directChildren(root)) {
                        await this.indexElement(child, frame);
                }
        }

        private async indexElement(el: Element, frame: RegistryLike): Promise<void> {
                await waitLitIfNeeded(el);

                /*
                 * Register Delphine components only.
                 * Ordinary HTML elements are traversed but not registered.
                 */
                if (isDelphineElement(el)) {
                        registerInFrame(frame, el);
                }

                /*
                 * A nested frame belongs to the current frame's registry,
                 * but its internal components belong exclusively to its own
                 * registry.
                 */
                if (isDelphineFrame(el)) {
                        return;
                }

                for (const child of directChildren(el)) {
                        await this.indexElement(child, frame);
                }
        }
}
