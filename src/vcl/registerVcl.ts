import { TComponentTypeRegistry, TMetaButton, TMetaPluginHost, TMetaForm, TMetaPanel } from '@vcl';

export function registerBuiltins(types: TComponentTypeRegistry) {
        types.register(TMetaButton.metaclass);
        types.register(TMetaPluginHost.metaclass);
        types.register(TMetaForm.metaclass);
        types.register(TMetaPanel.metaclass);
        // types.register(TEditClass);
        // types.register(TLabelClass);
}
