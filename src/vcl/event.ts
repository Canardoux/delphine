import { TControl, THandler } from './Control';
import { findMethod, dumpObject } from './Oops';
import { TMetaCompositeControl, TCompositeControl } from './CompositeControl';

export class EventManager {
        private _ac: AbortController | null = null;
        private clickTimer?: number;

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

        private dispatchDomEvent(form: TCompositeControl, ev: Event, eventType: string) {
                const targetElem = ev.target as Element | null;
                if (!targetElem) return;
                const evType = ev.type;

                const propName = `on${eventType}`;

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

        

        private dispatchPopupMenu(form: TCompositeControl, ev: Event, propName: string) {
                const targetElem = ev.target as Element | null;
                if (!targetElem) return;
                const evType = ev.type;

                //const propName = `on${eventType}`;

                let el = targetElem.closest('[data-delphine-component]');
                if (!el) return;

                let comp = this.getControlFromElement(form, el); // très important

                const sender = comp;

                while (comp) {
                        const menu = comp.getProp<string>(propName);

                        if (menu && menu != '') {
                                const owner = comp.form as TCompositeControl; // Frame ou Form
                                const popup = document.querySelector(`[data-delphine-component="TPopupMenu"][data-delphine-name="${CSS.escape(menu)}"]`) as HTMLElement | null;

                                if (popup && ev instanceof MouseEvent) {
                                        ev.preventDefault();

                                        popup.style.position = 'fixed';
                                        popup.style.left = `${ev.clientX}px`;
                                        popup.style.top = `${ev.clientY}px`;
                                        //popup.hidden = false;
                                        popup.classList.add('delphine-popup-menu');
                                        popup.querySelectorAll('.menu-item').forEach((item) => {
                                                item.addEventListener('click', (e) => {
                                                        e.stopPropagation();

                                                        const el = item as HTMLElement;
                                                        const handlerName = el.dataset.delphineOnclick;

                                                        popup.hidden = true;

                                                        if (handlerName) {



                                                                
                                                                const maybeMethod = findMethod(form, handlerName);
                                                                if (typeof maybeMethod === 'function') {
                                                                        maybeMethod.call(form, e, sender);
                                                                }
                                                        }
                                                });
                                        });

                                        popup.hidden = false;
                                }
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

                for (const type of ['click', 'input', 'change', 'keydown', 'frameevent', 'dbl-click', 'dblclick']) {
                        // same handler for everybody
                        const handler = (ev: Event) => {
                                if (ev.type === 'click') {
                                        clearTimeout(this.clickTimer);

                                        this.clickTimer = window.setTimeout(() => {
                                                this.dispatchDomEvent(form, ev, 'click');
                                        }, 250);
                                        return;
                                }

                                if (ev.type === 'dblclick') {
                                        clearTimeout(this.clickTimer);
                                }

                                this.dispatchDomEvent(form, ev, ev.type);
                        };
                        root.addEventListener(type, handler, { capture: true, signal });
                }

                const rightClickHandler = (ev: Event) => {
                        console.log(ev);
                        //ev.preventDefault();
                        this.dispatchDomEvent(form, ev, 'contextpopup');
                        this.dispatchPopupMenu(form, ev, 'popupmenu');
                };
                root.addEventListener('contextmenu', rightClickHandler, { capture: true, signal });
        }
}
