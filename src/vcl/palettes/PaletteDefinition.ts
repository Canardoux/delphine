// vcl/palettes/PaletteDefinition.ts
// vcl/palettes/PaletteDefinition.ts

import type { ComponentMetadata } from '../../designer/core/metadata';

export interface RuntimeComponentModule {
        registerRuntime(): void | Promise<void>;
}

export interface DesignComponentModule {
        designMetadata: ComponentMetadata;
}

export interface PaletteComponentDefinition {
        type: string;

        loadRuntime: () => Promise<RuntimeComponentModule>;

        loadDesign: () => Promise<DesignComponentModule>;
}

export interface PaletteDefinition {
        name: string;

        components: readonly PaletteComponentDefinition[];
}

// import type { TTypeRegistry } from '../TypeRegistry';
// import type { TDesignRegistry } from '../../designer/core/metadata';

// export interface RuntimeComponentModule {
//         registerRuntime(registry: TTypeRegistry): void | Promise<void>;
// }

// export interface DesignComponentModule {
//         registerDesign(registry: TDesignRegistry): void | Promise<void>;
// }

// export interface PaletteComponentDefinition {
//         type: string;

//         loadRuntime: () => Promise<RuntimeComponentModule>;
//         loadDesign: () => Promise<DesignComponentModule>;
// }

// export interface PaletteDefinition {
//         name: string;
//         components: readonly PaletteComponentDefinition[];
// }
