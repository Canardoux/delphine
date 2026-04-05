// createHelloVuePlugin.ts
// -----------------------

import { defineVuePlugin } from '@vcl/VuePlugin';
import type { PropSchema, ComponentSchema } from '@vcl/IComponent';
import { TFrame, TMetaFrame } from '@vcl/Frame';
import type { IForm } from '@vcl/IForm';
import { TForm } from '@vcl/Form';
import { TButton, TControl } from '@vcl';
import type { PropSpec } from '@vcl/Component';
import template from './HelloFrame.html?raw';

export class HelloFrame extends TFrame {
        changeMessage_onclick(_ev: Event | null, _sender: TControl) {
                debugger;
                const frameButton = this.componentRegistry.get<TButton>('myframeButton');
                frameButton!.caption = 'New message';
        }

        myframeButton_onclick(_ev: Event | null, _sender: TControl) {
                debugger;
                this.emit('MessageChanged', { message: 'New message from Frame' });
        }
}

export class MetaHelloFrame extends TMetaFrame<TFrame> {
        static metaclass = new MetaHelloFrame(TMetaFrame.metaclass, 'hello-frame');
        schema: ComponentSchema = {
                name: 'hello-frame',
                component: template,
                label: 'Hello Frame',
                category: 'Frame',
                props: {
                        message: { kind: 'string', default: 'Hello depuis Delphine' },
                        count: { kind: 'number', default: 0 },
                        enabled: { kind: 'boolean', default: true }
                }
        };

        protected constructor(superClass: TMetaFrame<TFrame>, name: string) {
                super(superClass, name);
        }

        create(name: string, form: TForm, parent: TControl) {
                const r = new HelloFrame(MetaHelloFrame.metaclass, name, form, parent);
                return r;
        }

        defProps(): PropSpec<any>[] {
                return [
                        /*
                        {
                                name: 'caption',
                                kind: 'string',
                                default: 'Caption',
                                retrieve: (o) => {
                                        return o.caption;
                                },
                                apply: (o, v) => (o.caption = String(v))
                        },
                        {
                                name: 'enabled',
                                kind: 'boolean',
                                default: true,
                                retrieve: (o) => {
                                        return o.enabled;
                                },
                                apply: (o, v) => (o.enabled = Boolean(v))
                        }
                                */
                ];
        }

        getSchema(): ComponentSchema {
                return this.schema;
        }
}
