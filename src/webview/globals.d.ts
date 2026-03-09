type DelphineVsCodeApi = {
        postMessage(message: unknown): void;
        getState?: () => unknown;
        setState?: (state: unknown) => void;
};

declare function acquireVsCodeApi(): DelphineVsCodeApi;

interface Window {
        __delphineVsCodeApi?: DelphineVsCodeApi;
        __delphineBootInstalled?: boolean;
        __delphineBootBridgeLoaded?: boolean;
}
