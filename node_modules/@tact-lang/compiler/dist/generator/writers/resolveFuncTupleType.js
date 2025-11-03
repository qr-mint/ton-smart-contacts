"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFuncTupleType = resolveFuncTupleType;
const resolveDescriptors_1 = require("../../types/resolveDescriptors");
function resolveFuncTupleType(descriptor, ctx) {
    // String
    if (typeof descriptor === "string") {
        return resolveFuncTupleType((0, resolveDescriptors_1.getType)(ctx.ctx, descriptor), ctx);
    }
    // TypeRef
    if (descriptor.kind === "ref") {
        return resolveFuncTupleType((0, resolveDescriptors_1.getType)(ctx.ctx, descriptor.name), ctx);
    }
    if (descriptor.kind === "map") {
        return "cell";
    }
    if (descriptor.kind === "ref_bounced") {
        throw Error("Unimplemented");
    }
    if (descriptor.kind === "void") {
        return "()";
    }
    // TypeDescription
    if (descriptor.kind === "primitive_type_decl") {
        if (descriptor.name === "Int") {
            return "int";
        }
        else if (descriptor.name === "Bool") {
            return "int";
        }
        else if (descriptor.name === "Slice") {
            return "slice";
        }
        else if (descriptor.name === "Cell") {
            return "cell";
        }
        else if (descriptor.name === "Builder") {
            return "builder";
        }
        else if (descriptor.name === "Address") {
            return "slice";
        }
        else if (descriptor.name === "String") {
            return "slice";
        }
        else if (descriptor.name === "StringBuilder") {
            return "tuple";
        }
        else {
            throw Error("Unknown primitive type: " + descriptor.name);
        }
    }
    else if (descriptor.kind === "struct" || descriptor.kind === "contract") {
        return "tuple";
    }
    // Unreachable
    throw Error("Unknown type: " + descriptor.kind);
}
