declare function acquireVsCodeApi(): {
        postMessage(message: unknown): void;
        getState?(): unknown;
        setState?(state: unknown): void;
};

/*
type DelphineVsCodeApi = {
        postMessage(message: unknown): void;
        getState?(): unknown;
        setState?(state: unknown): void;
};
*/

type DelphineWindow = Window &
        typeof globalThis & {
                __delphineVsCodeApi?: DelphineVsCodeApi;
                __delphineBootBridgeLoaded?: boolean;
        };
declare function acquireVsCodeApi(): DelphineVsCodeApi;

(() => {
        const w = window as DelphineWindow;
        const bridgeInstanceId = Math.random().toString(36).slice(2, 8);

        console.log(`[bridge ${bridgeInstanceId}] script evaluated`);
        console.log(`[bridge ${bridgeInstanceId}] href=${window.location.href}`);
        console.log(`[bridge ${bridgeInstanceId}] hasVsCodeApi=${typeof acquireVsCodeApi === 'function'}`);

        const hasVsCodeApi = typeof acquireVsCodeApi === 'function';
        const isFakeFrame = window.location.href.includes('/fake.html');

        if (!hasVsCodeApi || isFakeFrame) {
                console.log(`[bridge ${bridgeInstanceId}] not in host frame, skipping`);
                return;
        }

        if (w.__delphineBootBridgeLoaded) {
                console.log(`[bridge ${bridgeInstanceId}] bootBridge already loaded, skipping`);
                return;
        }

        w.__delphineBootBridgeLoaded = true;

        if (!w.__delphineVsCodeApi) {
                w.__delphineVsCodeApi = acquireVsCodeApi();
        }

        const vscode = w.__delphineVsCodeApi;
        if (!vscode) {
                console.log(`[bridge ${bridgeInstanceId}] VS Code API unavailable`);
                return;
        }

        console.log(`[bridge ${bridgeInstanceId}] installed in top-level webview`);
        console.log(`[bridge ${bridgeInstanceId}] adding message listener`);

        window.addEventListener('message', (event: MessageEvent) => {
                const msg = event.data;
                console.log(`[bridge ${bridgeInstanceId}] message received in parent`, msg);

                if (!msg) {
                        return;
                }

                if (msg.__delphineFromChild === true) {
                        const payload = msg.payload;

                        if (payload?.type === 'bridge:hello') {
                                console.log(`[bridge ${bridgeInstanceId}] child says hello`);
                                window.postMessage({ __delphineBridgeReady: true }, '*');
                                return;
                        }

                        console.log(`[bridge ${bridgeInstanceId}] child -> VSCode ${payload?.type ?? '<no-type>'}`);
                        vscode.postMessage(payload);
                        return;
                }
                if (typeof msg?.type === 'string') {
                        console.log(`[bridge ${bridgeInstanceId}] host received VSCode message ${msg.type} (no relay needed)`);
                        return;
                }
        });
})();
