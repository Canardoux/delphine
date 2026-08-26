// designer/core/registerDesignFrames.ts

import type { TDesignRegistry } from './metadata';

interface AppFrameConfig {
        name: string;
        className: string;
        tagName: string;
}

export function registerDesignFrames(
        registry: TDesignRegistry,
        frames: readonly AppFrameConfig[]
): void {
        for (const frame of frames) {
                registry.register({
                        type: frame.className,
                        instanceName: frame.name,
                        tagName: frame.tagName,
                        category: 'Frames',

                        container: false,
                        droppable: false,
                        resizable: true,

                        properties: [],
                        events: []
                });
        }
}
