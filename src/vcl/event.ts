import { TControl, THandler } from './Control';
import { TMetaCompositeControl, TCompositeControl } from './CompositeControl';

export class EventManager {
        private _ac: AbortController | null = null;

        private getControlFromElement(composit: TCompositeControl, el: Element): TControl | null {
                const comps = composit.componentRegistry.getInstances().values();
                for (const c of comps) {
                        if (c.elem == el) return c;
                }
                for (const frame of composit.frames) {
                        const f = frame as TCompositeControl;
                        const c = this.getControlFromElement(f, el);
                        if (c) return c;
                }
                return null;
        }

        private dispatchDomEvent(form: TCompositeControl, ev: Event) {
                const targetElem = ev.target as Element | null;
                if (!targetElem) return;

                const propName = `on${ev.type}`;

                let el = targetElem.closest('[data-delphine-component]');
                if (!el) return;

                let comp = this.getControlFromElement(form, el); // très important

                const sender = comp;

                while (comp) {
                        const handler = comp.getProp<THandler>(propName);

                        if (handler && handler.s) {
                                const owner = comp.form as TCompositeControl; // Frame ou Form
                                handler.fire(owner, propName, ev, sender);
                                return;
                        }

                        comp = comp.parent;
                }
        }

        installEventRouter(form: TCompositeControl, el: Element) {
                this._ac?.abort();
                this._ac = new AbortController();
                const { signal } = this._ac;

                const root = el as Element | null;
                if (!root) return;

                // same handler for everybody
                const handler = (ev: Event) => {
                        console.log(ev);
                        this.dispatchDomEvent(form, ev);
                };

                for (const type of ['click', 'input', 'change', 'keydown', 'frameevent']) {
                        root.addEventListener(type, handler, { capture: true, signal });
                }
                /*
                const meta = this.getMetaclass() as TMetaForm;
                for (const type in meta.domEvents) {
                        root.addEventListener(type, handler, { capture: true, signal });
                }
                        */

                //root!.addEventListener('FrameEvent', (e) => console.log(e));

                //this.listen();
        }
}
