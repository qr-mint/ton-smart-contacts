"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intMapValFormats = exports.intMapKeyFormats = void 0;
exports.resolveABIType = resolveABIType;
exports.createABITypeRefFromTypeRef = createABITypeRefFromTypeRef;
const ast_helpers_1 = require("../ast/ast-helpers");
const errors_1 = require("../error/errors");
const resolveDescriptors_1 = require("./resolveDescriptors");
const uintOptions = Object.fromEntries([...Array(256).keys()].map((key) => [
    `uint${key + 1}`,
    { type: "uint", format: key + 1 },
]));
const intOptions = Object.fromEntries([...Array(256).keys()].map((key) => [
    `int${key + 1}`,
    { type: "int", format: key + 1 },
]));
const intFormats = {
    ...uintOptions,
    ...intOptions,
    int257: { type: "int", format: 257 },
    coins: { type: "uint", format: "coins" },
    varint16: { type: "int", format: "varint16" },
    varint32: { type: "int", format: "varint32" },
    varuint16: { type: "uint", format: "varuint16" },
    varuint32: { type: "uint", format: "varuint32" },
};
// only fixed-width integer map keys are supported
exports.intMapKeyFormats = {
    ...uintOptions,
    ...intOptions,
    int257: { type: "int", format: 257 },
};
exports.intMapValFormats = { ...intFormats };
const cellFormats = {
    remaining: { type: "cell", format: "remainder" },
};
const sliceFormats = {
    remaining: { type: "slice", format: "remainder" },
    bytes32: { type: "fixed-bytes", format: 32 },
    bytes64: { type: "fixed-bytes", format: 64 },
};
const builderFormats = {
    remaining: { type: "builder", format: "remainder" },
};
function resolveABIType({ type, as, loc, }) {
    if (type.kind === "type_id" ||
        (type.kind === "optional_type" && type.typeArg.kind == "type_id")) {
        //
        // Primitive types
        //
        const typeId = type.kind === "type_id"
            ? type
            : type.typeArg.kind === "type_id"
                ? type.typeArg
                : (0, errors_1.throwInternalCompilerError)("Only optional type identifiers are supported now", type.typeArg.loc);
        if ((0, ast_helpers_1.isInt)(typeId)) {
            if (as) {
                const fmt = intFormats[(0, ast_helpers_1.idText)(as)];
                if (!fmt) {
                    (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(as)}`, loc);
                }
                return {
                    kind: "simple",
                    type: fmt.type,
                    optional: type.kind === "optional_type",
                    format: fmt.format,
                };
            }
            return {
                kind: "simple",
                type: "int",
                optional: type.kind === "optional_type",
                format: 257,
            }; // Default is maximum size int
        }
        if ((0, ast_helpers_1.isBool)(typeId)) {
            if (as) {
                (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(as)}`, loc);
            }
            return {
                kind: "simple",
                type: "bool",
                optional: type.kind === "optional_type",
            };
        }
        if ((0, ast_helpers_1.isCell)(typeId)) {
            if (as) {
                const fmt = cellFormats[(0, ast_helpers_1.idText)(as)];
                if (!fmt) {
                    (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(as)}`, loc);
                }
                return {
                    kind: "simple",
                    type: fmt.type,
                    optional: type.kind === "optional_type",
                    format: fmt.format,
                };
            }
            return {
                kind: "simple",
                type: "cell",
                optional: type.kind === "optional_type",
            };
        }
        if ((0, ast_helpers_1.isSlice)(typeId)) {
            if (as) {
                const fmt = sliceFormats[(0, ast_helpers_1.idText)(as)];
                if (!fmt) {
                    (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(as)}`, loc);
                }
                return {
                    kind: "simple",
                    type: fmt.type,
                    optional: type.kind === "optional_type",
                    format: fmt.format,
                };
            }
            return {
                kind: "simple",
                type: "slice",
                optional: type.kind === "optional_type",
            };
        }
        if ((0, ast_helpers_1.isBuilder)(typeId)) {
            if (as) {
                const fmt = builderFormats[(0, ast_helpers_1.idText)(as)];
                if (!fmt) {
                    (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(as)}`, loc);
                }
                return {
                    kind: "simple",
                    type: fmt.type,
                    optional: type.kind === "optional_type",
                    format: fmt.format,
                };
            }
            return {
                kind: "simple",
                type: "builder",
                optional: type.kind === "optional_type",
            };
        }
        if ((0, ast_helpers_1.isAddress)(typeId)) {
            if (as) {
                (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(as)}`, loc);
            }
            return {
                kind: "simple",
                type: "address",
                optional: type.kind === "optional_type",
            };
        }
        if ((0, ast_helpers_1.isString)(typeId)) {
            if (as) {
                (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(as)}`, loc);
            }
            return {
                kind: "simple",
                type: "string",
                optional: type.kind === "optional_type",
            };
        }
        if ((0, ast_helpers_1.isStringBuilder)(typeId)) {
            (0, errors_1.throwCompilationError)(`Unsupported type StringBuilder`, loc);
        }
        //
        // Structs
        //
        if (as) {
            if ((0, ast_helpers_1.eqNames)(as, "reference")) {
                return {
                    kind: "simple",
                    type: (0, ast_helpers_1.idText)(typeId),
                    optional: type.kind === "optional_type",
                    format: "ref",
                };
            }
            else {
                (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(as)}`, loc);
            }
        }
        return {
            kind: "simple",
            type: (0, ast_helpers_1.idText)(typeId),
            optional: type.kind === "optional_type",
        };
    }
    //
    // Map
    //
    if (type.kind === "map_type") {
        let key;
        let keyFormat = undefined;
        let value;
        let valueFormat = undefined;
        // Resolve key type
        if ((0, ast_helpers_1.isInt)(type.keyType)) {
            key = "int";
            if (type.keyStorageType) {
                const format = exports.intMapKeyFormats[(0, ast_helpers_1.idText)(type.keyStorageType)];
                if (!format) {
                    (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(type.keyStorageType)} for map key`, loc);
                }
                key = format.type;
                keyFormat = format.format;
            }
        }
        else if ((0, ast_helpers_1.isAddress)(type.keyType)) {
            key = "address";
            if (type.keyStorageType) {
                (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(type.keyStorageType)} for map key`, loc);
            }
        }
        else {
            (0, errors_1.throwCompilationError)(`Unsupported map key type ${(0, errors_1.idTextErr)(type.keyType)}`, loc);
        }
        // Resolve value type
        if ((0, ast_helpers_1.isInt)(type.valueType)) {
            value = "int";
            if (type.valueStorageType) {
                const format = exports.intMapValFormats[(0, ast_helpers_1.idText)(type.valueStorageType)];
                if (!format) {
                    (0, errors_1.throwCompilationError)(`Unsupported format ${(0, ast_helpers_1.idText)(type.valueStorageType)} for map value`, loc);
                }
                value = format.type;
                valueFormat = format.format;
            }
        }
        else if ((0, ast_helpers_1.isBool)(type.valueType)) {
            value = "bool";
            if (type.valueStorageType) {
                (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(type.valueStorageType)} for map value`, loc);
            }
        }
        else if ((0, ast_helpers_1.isCell)(type.valueType)) {
            value = "cell";
            valueFormat = "ref";
            if (type.valueStorageType &&
                (0, ast_helpers_1.eqNames)(type.valueStorageType, "reference")) {
                (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(type.valueStorageType)} for map value`, loc);
            }
        }
        else if ((0, ast_helpers_1.isSlice)(type.valueType)) {
            (0, errors_1.throwCompilationError)(`Unsupported map value type ${(0, errors_1.idTextErr)(type.valueType)}`, loc);
        }
        else if ((0, ast_helpers_1.isAddress)(type.valueType)) {
            value = "address";
            if (type.valueStorageType) {
                (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(type.valueStorageType)} for map value`, loc);
            }
        }
        else if ((0, ast_helpers_1.isString)(type.valueType)) {
            (0, errors_1.throwCompilationError)(`Unsupported map value type ${(0, errors_1.idTextErr)(type.valueType)}`, loc);
        }
        else if ((0, ast_helpers_1.isStringBuilder)(type.valueType) ||
            (0, ast_helpers_1.isBuilder)(type.valueType)) {
            (0, errors_1.throwCompilationError)(`Unsupported map value type ${(0, errors_1.idTextErr)(type.valueType)}`, loc);
        }
        else {
            value = (0, ast_helpers_1.idText)(type.valueType);
            valueFormat = "ref";
            if (type.valueStorageType &&
                (0, ast_helpers_1.eqNames)(type.valueStorageType, "reference")) {
                (0, errors_1.throwCompilationError)(`Unsupported format ${(0, errors_1.idTextErr)(type.valueStorageType)} for map value`, loc);
            }
        }
        return { kind: "dict", key, keyFormat, value, valueFormat };
    }
    (0, errors_1.throwCompilationError)(`Unsupported type`, loc);
}
function createABITypeRefFromTypeRef(ctx, src, loc) {
    if (src.kind === "ref") {
        // Primitives
        if (src.name === "Int") {
            return {
                kind: "simple",
                type: "int",
                optional: src.optional,
                format: 257,
            }; // Default is maximum size int
        }
        if (src.name === "Bool") {
            return { kind: "simple", type: "bool", optional: src.optional };
        }
        if (src.name === "Cell") {
            return { kind: "simple", type: "cell", optional: src.optional };
        }
        if (src.name === "Slice") {
            return { kind: "simple", type: "slice", optional: src.optional };
        }
        if (src.name === "Builder") {
            return { kind: "simple", type: "builder", optional: src.optional };
        }
        if (src.name === "Address") {
            return { kind: "simple", type: "address", optional: src.optional };
        }
        if (src.name === "String") {
            return { kind: "simple", type: "string", optional: src.optional };
        }
        if (src.name === "StringBuilder") {
            (0, errors_1.throwInternalCompilerError)(`Unsupported type "${src.name}"`);
        }
        // Structs
        const type = (0, resolveDescriptors_1.getType)(ctx, src.name);
        if (type.kind === "contract") {
            return {
                kind: "simple",
                type: src.name + "$Data",
                optional: src.optional,
            };
        }
        else {
            return { kind: "simple", type: src.name, optional: src.optional };
        }
    }
    if (src.kind === "map") {
        let key;
        let keyFormat = undefined;
        let value;
        let valueFormat = undefined;
        // Resolve key type
        if (src.key === "Int") {
            key = "int";
            if (src.keyAs) {
                const format = exports.intMapKeyFormats[src.keyAs];
                if (!format) {
                    (0, errors_1.throwCompilationError)(`Unsupported format ${src.keyAs} for map key`, loc);
                }
                key = format.type;
                keyFormat = format.format;
            }
        }
        else if (src.key === "Address") {
            key = "address";
            if (src.keyAs) {
                (0, errors_1.throwCompilationError)(`Unsupported format ${src.keyAs} for map key`, loc);
            }
        }
        else {
            (0, errors_1.throwInternalCompilerError)(`Unsupported map key type "${src.key}"`);
        }
        // Resolve value type
        if (src.value === "Int") {
            value = "int";
            if (src.valueAs) {
                const format = exports.intMapValFormats[src.valueAs];
                if (!format) {
                    (0, errors_1.throwCompilationError)(`Unsupported format ${src.valueAs} for map value`, loc);
                }
                value = format.type;
                valueFormat = format.format;
            }
        }
        else if (src.value === "Bool") {
            value = "bool";
            if (src.valueAs) {
                (0, errors_1.throwCompilationError)(`Unsupported format ${src.valueAs} for map value`, loc);
            }
        }
        else if (src.value === "Cell") {
            value = "cell";
            valueFormat = "ref";
            if (src.valueAs && src.valueAs !== "reference") {
                (0, errors_1.throwCompilationError)(`Unsupported format ${src.valueAs} for map value`, loc);
            }
        }
        else if (src.value === "Slice") {
            (0, errors_1.throwInternalCompilerError)(`Unsupported map value type "${src.value}"`);
        }
        else if (src.value === "Address") {
            value = "address";
            if (src.valueAs) {
                (0, errors_1.throwCompilationError)(`Unsupported format ${src.valueAs} for map value`, loc);
            }
        }
        else if (src.value === "String") {
            (0, errors_1.throwInternalCompilerError)(`Unsupported map value type "${src.value}"`);
        }
        else if (src.value === "StringBuilder" || src.value === "Builder") {
            (0, errors_1.throwInternalCompilerError)(`Unsupported map value type "${src.value}"`);
        }
        else {
            value = src.value;
            valueFormat = "ref";
            if (src.valueAs && src.valueAs !== "reference") {
                (0, errors_1.throwCompilationError)(`Unsupported format ${src.valueAs} for map value`, loc);
            }
        }
        return { kind: "dict", key, keyFormat, value, valueFormat };
    }
    if (src.kind === "ref_bounced") {
        (0, errors_1.throwInternalCompilerError)("Unexpected bounced reference");
    }
    (0, errors_1.throwInternalCompilerError)(`Unsupported type`);
}
