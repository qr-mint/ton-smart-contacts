"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showValue = showValue;
exports.receiverSelectorName = receiverSelectorName;
exports.printTypeRef = printTypeRef;
exports.typeRefEquals = typeRefEquals;
const errors_1 = require("../error/errors");
const ast_helpers_1 = require("../ast/ast-helpers");
// https://github.com/microsoft/TypeScript/issues/35164 and
// https://github.com/microsoft/TypeScript/pull/57293
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
function showValue(val) {
    switch (val.kind) {
        case "number":
            return val.value.toString(val.base);
        case "simplified_string":
            return val.value;
        case "boolean":
            return val.value ? "true" : "false";
        case "address":
            return val.value.toRawString();
        case "cell":
        case "slice":
            return val.value.toString();
        case "null":
            return "null";
        case "struct_value": {
            const assocList = val.args.map((field) => `${(0, ast_helpers_1.idText)(field.field)}: ${showValue(field.initializer)}`);
            return `{${assocList.join(",")}}`;
        }
        default:
            (0, errors_1.throwInternalCompilerError)("Invalid value");
    }
}
// TODO: improve this for empty and fallbacks
function receiverSelectorName(selector) {
    switch (selector.kind) {
        case "internal-binary":
        case "bounce-binary":
        case "external-binary":
            return selector.type;
        case "internal-comment":
        case "external-comment":
            return selector.comment;
        case "internal-empty":
        case "external-empty":
            return selector.kind;
        case "internal-fallback":
        case "bounce-fallback":
        case "external-fallback":
            return selector.kind;
        case "internal-comment-fallback":
        case "external-comment-fallback":
            return selector.kind;
    }
}
function printTypeRef(src) {
    switch (src.kind) {
        case "ref":
            return `${src.name}${src.optional ? "?" : ""}`;
        case "map":
            return `map<${src.key + (src.keyAs ? " as " + src.keyAs : "")}, ${src.value + (src.valueAs ? " as " + src.valueAs : "")}>`;
        case "void":
            return "<void>";
        case "null":
            return "<null>";
        case "ref_bounced":
            return `bounced<${src.name}>`;
    }
}
function typeRefEquals(a, b) {
    if (a.kind !== b.kind) {
        return false;
    }
    if (a.kind === "ref" && b.kind === "ref") {
        return a.name === b.name && a.optional === b.optional;
    }
    if (a.kind === "map" && b.kind === "map") {
        return a.key === b.key && a.value === b.value;
    }
    if (a.kind === "ref_bounced" && b.kind === "ref_bounced") {
        return a.name === b.name;
    }
    if (a.kind === "null" && b.kind === "null") {
        return true;
    }
    if (a.kind === "void" && b.kind === "void") {
        return true;
    }
    return false;
}
