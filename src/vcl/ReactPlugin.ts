/*
import React from 'react';
import ReactDOM from 'react-dom/client';
import type { UIPluginFactory } from './Plugin';

export function defineReactPlugin(Component: any): UIPluginFactory {
        return ({ host }) => {
                let root: any;

                return {
                        id: Component.name ?? 'react-plugin',

                        mount(container, props, services) {
                                root = ReactDOM.createRoot(container);
                                root.render(
                                        React.createElement(Component, {
                                                state: props,
                                                services,
                                                hostName: host.name
                                        })
                                );
                        },

                        update(props) {
                                root.render(
                                        React.createElement(Component, {
                                                state: props
                                        })
                                );
                        },

                        unmount() {
                                root?.unmount();
                        }
                };
        };
}
*/
