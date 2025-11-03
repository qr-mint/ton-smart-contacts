"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveErrors = resolveErrors;
exports.getAllErrors = getAllErrors;
exports.getErrorId = getErrorId;
const context_1 = require("../context/context");
const ast_helpers_1 = require("../ast/ast-helpers");
const iterators_1 = require("../ast/iterators");
const constEval_1 = require("../optimizer/constEval");
const errors_1 = require("../error/errors");
const resolveDescriptors_1 = require("./resolveDescriptors");
const interpreter_1 = require("../optimizer/interpreter");
const util_1 = require("../ast/util");
const sha256_1 = require("../utils/sha256");
const exceptions = (0, context_1.createContextStore)();
function stringId(src) {
    return Number((0, sha256_1.highest32ofSha256)((0, sha256_1.sha256)(src)));
}
function exceptionId(src) {
    return (stringId(src) % 63000) + 1000;
}
function resolveStringsInAST(ast, ctx, util) {
    (0, iterators_1.traverse)(ast, (node) => {
        if (node.kind === "static_call" && (0, ast_helpers_1.isRequire)(node.function)) {
            if (node.args.length !== 2) {
                return;
            }
            const resolved = (0, interpreter_1.ensureSimplifiedString)((0, constEval_1.evalConstantExpression)(node.args[1], ctx, util)).value;
            if (!exceptions.get(ctx, resolved)) {
                const id = exceptionId(resolved);
                if (Array.from(exceptions.all(ctx).values()).find((v) => v.id === id)) {
                    (0, errors_1.throwInternalCompilerError)(`Duplicate error id: "${resolved}"`);
                }
                ctx = exceptions.set(ctx, resolved, { value: resolved, id });
            }
        }
    });
    return ctx;
}
function resolveErrors(ctx, Ast) {
    const util = (0, util_1.getAstUtil)(Ast);
    // Process all static functions
    for (const f of (0, resolveDescriptors_1.getAllStaticFunctions)(ctx)) {
        ctx = resolveStringsInAST(f.ast, ctx, util);
    }
    // Process all static constants
    for (const f of (0, resolveDescriptors_1.getAllStaticConstants)(ctx)) {
        ctx = resolveStringsInAST(f.ast, ctx, util);
    }
    // Process all types
    for (const t of (0, resolveDescriptors_1.getAllTypes)(ctx)) {
        // Process fields
        for (const f of t.fields) {
            ctx = resolveStringsInAST(f.ast, ctx, util);
        }
        // Process constants
        for (const f of t.constants) {
            ctx = resolveStringsInAST(f.ast, ctx, util);
        }
        // Process init
        if (t.init) {
            ctx = resolveStringsInAST(t.init.ast, ctx, util);
        }
        // Process receivers
        for (const f of t.receivers) {
            ctx = resolveStringsInAST(f.ast, ctx, util);
        }
        // Process functions
        for (const f of t.functions.values()) {
            ctx = resolveStringsInAST(f.ast, ctx, util);
        }
    }
    return ctx;
}
function getAllErrors(ctx) {
    return Array.from(exceptions.all(ctx).values());
}
function getErrorId(value, ctx) {
    const ex = exceptions.get(ctx, value);
    if (!ex) {
        (0, errors_1.throwInternalCompilerError)(`Error not found: ${value}`);
    }
    return ex.id;
}
