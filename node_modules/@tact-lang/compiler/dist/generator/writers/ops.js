"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ops = void 0;
function used(name, ctx) {
    const c = ctx.currentContext();
    if (c) {
        ctx.used(name);
    }
    return name;
}
exports.ops = {
    // Type operations
    writer: (type, ctx) => used(`$${type}$_store`, ctx),
    writerCell: (type, ctx) => used(`$${type}$_store_cell`, ctx),
    writerCellOpt: (type, ctx) => used(`$${type}$_store_opt`, ctx),
    reader: (type, opcode, ctx) => {
        return used(`$${type}$_load${opcode === "no-opcode" ? "_without_opcode" : ""}`, ctx);
    },
    readerNonModifying: (type, ctx) => used(`$${type}$_load_not_mut`, ctx),
    readerBounced: (type, ctx) => used(`$${type}$_load_bounced`, ctx),
    readerOpt: (type, ctx) => used(`$${type}$_load_opt`, ctx),
    typeField: (type, name, ctx) => used(`$${type}$_get_${name}`, ctx),
    typeTensorCast: (type, ctx) => used(`$${type}$_tensor_cast`, ctx),
    typeNotNull: (type, ctx) => used(`$${type}$_not_null`, ctx),
    typeAsOptional: (type, ctx) => used(`$${type}$_as_optional`, ctx),
    typeToTuple: (type, ctx) => used(`$${type}$_to_tuple`, ctx),
    typeToOptTuple: (type, ctx) => used(`$${type}$_to_opt_tuple`, ctx),
    typeFromTuple: (type, ctx) => used(`$${type}$_from_tuple`, ctx),
    typeFromOptTuple: (type, ctx) => used(`$${type}$_from_opt_tuple`, ctx),
    typeToExternal: (type, ctx) => used(`$${type}$_to_external`, ctx),
    typeToOptExternal: (type, ctx) => used(`$${type}$_to_opt_external`, ctx),
    typeConstructor: (type, fields, ctx) => used(`$${type}$_constructor_${fields.join("_")}`, ctx),
    // Contract operations
    contractInit: (type, ctx) => used(`$${type}$_contract_init`, ctx),
    contractChildGetCode: (type, ctx) => used(`$${type}$_child_get_code`, ctx),
    contractInitChild: (type, ctx) => used(`$${type}$_init_child`, ctx),
    contractCodeChild: (type, ctx) => used(`$${type}$_code_child`, ctx),
    contractLoad: (type, ctx) => used(`$${type}$_contract_load`, ctx),
    contractStore: (type, ctx) => used(`$${type}$_contract_store`, ctx),
    // Functions
    extension: (type, name) => `$${type}$_fun_${name}`,
    global: (name) => `$global_${name}`,
    nonModifying: (name) => `${name}$not_mut`,
    // Constants
    str: (id, ctx) => used(`__gen_str_${id}`, ctx),
};
