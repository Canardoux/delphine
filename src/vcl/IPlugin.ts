// IPlugin.ts
/*
 * Copyright 2026 Canardoux.
 *
 * This file is part of the Delphine project.
 *
 * Delphine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 (GPL3), as published by
 * the Free Software Foundation.
 *
 * Delphine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Delphine.  If not, see <https://www.gnu.org/licenses/>.
 */

import type { IComponent } from 'grapesjs';
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type UIPluginMessage = { type: 'setProp'; hostName: string; key: string; value: any } | { type: 'event'; hostName: string; name: string; detail?: any };

export interface UIPluginInstance<Props extends Json = Json> {
        readonly id: string;

        // Called exactly once after creation (for a given instance).
        mount(container: HTMLElement, props: Props, services: DelphineServices): void;

        // Called any time props change (may be frequent).
        update(props: Props): void;

        // Called exactly once before disposal.
        unmount(): void;

        // Finished with this plugin
        dispose?(): void;

        // Optional ergonomics.
        getSizeHints?(): number;
        focus?(): void;

        // Optional persistence hook (Delphine may store & restore this).
        serializeState?(): Json;
}

export type UIPluginFactory<Props extends Json = Json> = (args: { host: IPluginHost; form: IComponent }) => UIPluginInstance<Props>;

export interface DelphineServices {
        log: {
                debug(msg: string, data?: any): void;
                info(msg: string, data?: any): void;
                warn(msg: string, data?: any): void;
                error(msg: string, data?: any): void;
        };

        bus: {
                on(event: string, handler: (payload: any) => void): () => void;
                emit(event: string, payload: any): void;
        };

        storage: {
                get(key: string): Promise<any> | null;
                set(key: string, value: any): Promise<void> | null;
                remove(key: string): Promise<void> | null;
        };

        notify?: (msg: UIPluginMessage) => void;

        // futur
        // i18n?: ...
        // nav?: ...
}
export interface IPluginHost {
        setPluginSpec(spec: { plugin: string | null; props: any }): void;
        mountPluginIfReady(/*services: DelphineServices*/): void;
        getName(): string;
}

export interface IMetaPluginHost {}
