"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBuiltins = registerBuiltins;
const _vcl_1 = require("@vcl");
function registerBuiltins(types) {
    types.register(_vcl_1.TMetaButton.metaclass);
    types.register(_vcl_1.TMetaPluginHost.metaclass);
    types.register(_vcl_1.TMetaForm.metaclass);
    types.register(_vcl_1.TMetaPanel.metaclass);
    // types.register(TEditClass);
    // types.register(TLabelClass);
}
//# sourceMappingURL=registerVcl.js.map