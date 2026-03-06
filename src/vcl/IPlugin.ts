export type UIPluginMessage = { type: 'setProp'; hostName: string; key: string; value: any } | { type: 'event'; hostName: string; name: string; detail?: any };

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
}
