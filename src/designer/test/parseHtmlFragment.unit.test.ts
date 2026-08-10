// designer/test/parseHtmlFragment.unit.test.test.ts

import { describe, expect, it } from 'vitest';
import { TDesignRegistry, registerDesignPalettes, registerVclDesignMetadata } from '../core/metadata';
import { parseHtmlFragment } from '../core/parser/parseHtmlFragment';
import { serializeHtmlFragment } from '../core/serializer/serializeHtmlFragment';

describe('parseHtmlFragment', () => {
        it('parses a panel containing a button', async () => {
                const registry = new TDesignRegistry();

                await registerVclDesignMetadata(registry);
                await registerDesignPalettes(registry, ['standard']);

                const source = `
                        <lit-panel
                                data-delphine-component="TPanel"
                                data-delphine-name="Panel1"
                                left="10"
                                top="20">

                                <lit-button
                                        data-delphine-component="TButton"
                                        data-delphine-name="Button1"
                                        caption="Click me"
                                        enabled="false"
                                        data-delphine-onclick="Button1Click">
                                </lit-button>

                        </lit-panel>
                `;

                const document = parseHtmlFragment(source, {
                        frameName: 'MainFrame',
                        frameType: 'MainFrame',
                        designRegistry: registry
                });

                expect(document.root.type).toBe('MainFrame');
                expect(document.root.name).toBe('MainFrame');

                expect(document.root.children).toHaveLength(1);

                const panel = document.root.children[0];

                expect(panel.type).toBe('TPanel');
                expect(panel.name).toBe('Panel1');
                expect(panel.children).toHaveLength(1);
                expect(panel.properties).toEqual({
                        left: 10,
                        top: 20
                });

                const button = panel.children[0];

                expect(button.type).toBe('TButton');
                expect(button.name).toBe('Button1');
                expect(button.children).toHaveLength(0);

                expect(button.properties).toEqual({
                        caption: 'Click me',
                        enabled: false
                });

                expect(button.events).toEqual({
                        onclick: 'Button1Click'
                });
        });

        it('rejects an invalid boolean property', async () => {
                const registry = new TDesignRegistry();

                await registerVclDesignMetadata(registry);

                await registerDesignPalettes(registry, ['standard']);

                const source = `

                        <lit-button

                                data-delphine-name="Button1"

                                enabled="maybe">

                        </lit-button>

                `;

                expect(() => {
                        parseHtmlFragment(source, {
                                frameName: 'MainFrame',

                                frameType: 'MainFrame',

                                designRegistry: registry
                        });
                }).toThrow('Invalid boolean "maybe" for property "enabled".');
        });

        it('source -> parseHtmlFragment() -> serializeHtmlFragment()', async () => {
                const registry = new TDesignRegistry();

                await registerVclDesignMetadata(registry);
                await registerDesignPalettes(registry, ['standard']);

                const source = `
                                        <lit-panel
                                                data-delphine-component="TPanel"
                                                data-delphine-name="Panel1"
                                                left="10"
                                                top="20">

                                                <lit-button
                                                        data-delphine-component="TButton"
                                                        data-delphine-name="Button1"
                                                        caption="Click me"
                                                        enabled="false"
                                                        data-delphine-onclick="Button1Click">
                                                </lit-button>

                                        </lit-panel>
                `;

                const document1 = parseHtmlFragment(source, {
                        frameName: 'MainFrame',
                        frameType: 'MainFrame',
                        designRegistry: registry
                });
                const serialized = serializeHtmlFragment(document1, {
                        designRegistry: registry
                });
                const document2 = parseHtmlFragment(serialized, {
                        frameName: 'MainFrame',
                        frameType: 'MainFrame',
                        designRegistry: registry
                });

                expect(document2).toEqual(document1);
        });
});
