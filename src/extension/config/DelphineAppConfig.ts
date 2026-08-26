// extension/config/DelphineAppConfig.ts

export interface DelphineFrameConfig {
        name: string;
        className: string;
        type: string;

        // chemin déclaré dans app.json
        url: string;

        // URL résolue par l'extension pour le Designer
        runtimeUrl?: string;

        tagName: string;
        module?: string;
        props?: unknown[];
        events?: unknown[];
}

export interface DelphineFormConfig {
        name: string;
        frame: string;
        autoCreate?: boolean;
}

export interface DelphineAppConfig {
        name: string;

        mainForm?: string;

        forms?: DelphineFormConfig[];

        frames?: DelphineFrameConfig[];

        palettes?: string[];

        ui?: {
                theme?: string;
                density?: string;
                fontScale?: number;
        };
}
