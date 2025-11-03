"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.funcIdOf = funcIdOf;
exports.funcInitIdOf = funcInitIdOf;
const ast_helpers_1 = require("../../ast/ast-helpers");
function funcIdOf(ident) {
    if (typeof ident === "string") {
        return "$" + ident;
    }
    return "$" + (0, ast_helpers_1.idText)(ident);
}
function funcInitIdOf(ident) {
    if (typeof ident === "string") {
        return ident + "$init";
    }
    return (0, ast_helpers_1.idText)(ident) + "$init";
}
