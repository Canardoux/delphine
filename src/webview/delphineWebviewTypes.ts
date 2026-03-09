export type DelphineWindow = Window & {
        __delphineVsCodeApi?: DelphineVsCodeApi;
        __delphineBootBridgeLoaded?: boolean;
};

export type DelphineVsCodeApi = {
        postMessage(message: unknown): void;
        getState?: () => unknown;
        setState?: (state: unknown) => void;
};

declare global {
        interface Window {
                __delphineVsCodeApi?: DelphineVsCodeApi;
                __delphineBootInstalled?: boolean;
                __delphineBootBridgeLoaded?: boolean;
        }
}

export {};
