declare function acquireVsCodeApi(): {
        postMessage(message: unknown): void;
        getState?(): unknown;
        setState?(state: unknown): void;
};

declare function acquireVsCodeApi(): DelphineVsCodeApi;

type DelphineWindow = Window &
        typeof globalThis & {
                __delphineVsCodeApi?: DelphineVsCodeApi;
                __delphineBootBridgeLoaded?: boolean;
                __delphineBootEditorInjected?: boolean;
        };

(() => {
        const w = window as DelphineWindow;
        const bridgeInstanceId = Math.random().toString(36).slice(2, 8);

        console.log(`[bridge ${bridgeInstanceId}] script evaluated`);
        console.log(`[bridge ${bridgeInstanceId}] href=${window.location.href}`);

        const isFakeFrame = window.location.href.includes('/fake.html');
        if (isFakeFrame) {
                console.log(`[bridge ${bridgeInstanceId}] fake frame, skipping`);
                return;
        }

        let attempts = 0;
        const maxAttempts = 20;
        const retryDelayMs = 50;

        const tryInstall = (): void => {
                attempts += 1;

                const hasVsCodeApi = typeof acquireVsCodeApi === 'function';
                console.log(`[bridge ${bridgeInstanceId}] tryInstall #${attempts}, hasVsCodeApi=${hasVsCodeApi}`);

                if (!hasVsCodeApi) {
                        if (attempts < maxAttempts) {
                                window.setTimeout(tryInstall, retryDelayMs);
                        } else {
                                console.log(`[bridge ${bridgeInstanceId}] VS Code API unavailable after retries`);
                        }
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

                if (!w.__delphineBootEditorInjected) {
                        w.__delphineBootEditorInjected = true;

                        const currentScript = document.currentScript as HTMLScriptElement | null;
                        const bridgeSrc = currentScript?.src;

                        if (bridgeSrc) {
                                const bootEditorSrc = new URL('./bootEditor.js', bridgeSrc).toString();

                                console.log(`[bridge ${bridgeInstanceId}] injecting bootEditor ${bootEditorSrc}`);

                                const script = document.createElement('script');
                                script.type = 'module';
                                script.src = bootEditorSrc;
                                document.body.appendChild(script);
                        } else {
                                console.log(`[bridge ${bridgeInstanceId}] unable to resolve bootEditor src`);
                        }
                }

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
                        }
                });
        };

        tryInstall();
})();
