"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalFunctions = void 0;
const core_1 = require("@ton/core");
const features_1 = require("../config/features");
const writeConstant_1 = require("../generator/writers/writeConstant");
const writeExpression_1 = require("../generator/writers/writeExpression");
const errors_1 = require("../error/errors");
const resolveErrors_1 = require("../types/resolveErrors");
const path_1 = __importDefault(require("path"));
const process_1 = require("process");
const filePath_1 = require("../utils/filePath");
const interpreter_1 = require("../optimizer/interpreter");
const ast_helpers_1 = require("../ast/ast-helpers");
const sha256_1 = require("../utils/sha256");
const ops_1 = require("../generator/writers/ops");
exports.GlobalFunctions = new Map([
    [
        "ton",
        {
            name: "ton",
            resolve: (ctx, args, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("ton() expects single string argument", ref);
                }
                const arg0 = args[0];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("ton() expects single string argument", ref);
                }
                if (arg0.name !== "String") {
                    (0, errors_1.throwCompilationError)("ton() expects single string argument", ref);
                }
                return { kind: "ref", name: "Int", optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 1) {
                    (0, errors_1.throwCompilationError)("ton() expects single string argument", ref);
                }
                const resolved0 = resolved[0];
                // FIXME: When optimizer step added, change the following line to:
                // const str = ensureSimplifiedString(resolved0).value;
                const str = (0, interpreter_1.interpretEscapeSequences)((0, interpreter_1.ensureString)(resolved0).value, resolved0.loc);
                return (0, core_1.toNano)(str).toString(10);
            },
        },
    ],
    [
        "require",
        {
            name: "require",
            resolve: (ctx, args, ref) => {
                if (args.length !== 2) {
                    (0, errors_1.throwCompilationError)("require() expects two arguments", ref);
                }
                const arg0 = args[0];
                const arg1 = args[1];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("require() expects first Bool argument", ref);
                }
                if (arg0.name !== "Bool") {
                    (0, errors_1.throwCompilationError)("require() expects first Bool argument", ref);
                }
                if (arg1.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("require() expects second string argument", ref);
                }
                if (arg1.name !== "String") {
                    (0, errors_1.throwCompilationError)("require() expects second string argument", ref);
                }
                return { kind: "void" };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 2) {
                    (0, errors_1.throwCompilationError)("require() expects two arguments", ref);
                }
                const resolved1 = resolved[1];
                // FIXME: When optimizer step added, change the following line to:
                // const str = ensureSimplifiedString(resolved1).value;
                const str = (0, interpreter_1.interpretEscapeSequences)((0, interpreter_1.ensureString)(resolved1).value, resolved1.loc);
                return `throw_unless(${(0, resolveErrors_1.getErrorId)(str, ctx.ctx)}, ${(0, writeExpression_1.writeExpression)(resolved[0], ctx)})`;
            },
        },
    ],
    [
        "address",
        {
            name: "address",
            resolve: (ctx, args, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("address() expects one argument", ref);
                }
                const arg0 = args[0];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("address() expects string argument", ref);
                }
                if (arg0.name !== "String") {
                    (0, errors_1.throwCompilationError)("address() expects string argument", ref);
                }
                return { kind: "ref", name: "Address", optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 1) {
                    (0, errors_1.throwCompilationError)("address() expects one argument", ref);
                }
                const resolved0 = resolved[0];
                // FIXME: When optimizer step added, change the following line to:
                // const str = ensureSimplifiedString(resolved0).value;
                const str = (0, interpreter_1.interpretEscapeSequences)((0, interpreter_1.ensureString)(resolved0).value, resolved0.loc);
                let address;
                try {
                    address = core_1.Address.parse(str);
                }
                catch {
                    (0, errors_1.throwCompilationError)(`${str} is not a valid address`, ref);
                }
                if (address.workChain !== 0 && address.workChain !== -1) {
                    (0, errors_1.throwCompilationError)(`Address ${str} invalid address`, ref);
                }
                // Generate address
                const res = (0, writeConstant_1.writeAddress)(address, ctx);
                ctx.used(res);
                return res + "()";
            },
        },
    ],
    [
        "cell",
        {
            name: "cell",
            resolve: (ctx, args, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("cell() expects one argument", ref);
                }
                const arg0 = args[0];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("cell() expects string argument", ref);
                }
                if (arg0.name !== "String") {
                    (0, errors_1.throwCompilationError)("cell() expects string argument", ref);
                }
                return { kind: "ref", name: "Cell", optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 1) {
                    (0, errors_1.throwCompilationError)("cell() expects one argument", ref);
                }
                // Load cell data
                const resolved0 = resolved[0];
                // FIXME: When optimizer step added, change the following line to:
                // const str = ensureSimplifiedString(resolved0).value;
                const str = (0, interpreter_1.interpretEscapeSequences)((0, interpreter_1.ensureString)(resolved0).value, resolved0.loc);
                let c;
                try {
                    c = core_1.Cell.fromBase64(str);
                }
                catch (_) {
                    (0, errors_1.throwCompilationError)(`Invalid cell ${str}`, ref);
                }
                // Generate address
                const res = (0, writeConstant_1.writeCell)(c, ctx);
                ctx.used(res);
                return `${res}()`;
            },
        },
    ],
    [
        "dump",
        {
            name: "dump",
            resolve: (ctx, args, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("dump expects 1 argument", ref);
                }
                return { kind: "void" };
            },
            generate: (ctx, args, resolved, ref) => {
                if (!(0, features_1.enabledDebug)(ctx.ctx)) {
                    return `${ctx.used("__tact_nop")}()`;
                }
                const arg0 = args[0];
                const filePath = ref.file
                    ? (0, filePath_1.posixNormalize)(path_1.default.relative((0, process_1.cwd)(), ref.file))
                    : "unknown";
                const lineCol = ref.interval.getLineAndColumn();
                const debugPrint1 = `File ${filePath}:${lineCol.lineNum}:${lineCol.colNum}:`;
                const contentsId = (0, writeConstant_1.writeString)(ref.interval.contents, ctx);
                ctx.used(contentsId);
                const debugPrint2 = `${contentsId}()`;
                if (arg0.kind === "map") {
                    const exp = (0, writeExpression_1.writeExpression)(resolved[0], ctx);
                    return `${ctx.used(`__tact_debug`)}(${exp}, ${debugPrint2}, "${debugPrint1}")`;
                }
                else if (arg0.kind === "null") {
                    return `${ctx.used(`__tact_debug_str`)}("null", ${debugPrint2}, "${debugPrint1}")`;
                }
                else if (arg0.kind === "void") {
                    return `${ctx.used(`__tact_debug_str`)}("void", ${debugPrint2}, "${debugPrint1}")`;
                }
                else if (arg0.kind === "ref") {
                    if (arg0.name === "Int") {
                        const exp = (0, writeExpression_1.writeExpression)(resolved[0], ctx);
                        return `${ctx.used(`__tact_debug_str`)}(${ctx.used(ops_1.ops.extension("Int", "toString"))}(${exp}), ${debugPrint2}, "${debugPrint1}")`;
                    }
                    else if (arg0.name === "Bool") {
                        const exp = (0, writeExpression_1.writeExpression)(resolved[0], ctx);
                        return `${ctx.used(`__tact_debug_bool`)}(${exp}, ${debugPrint2}, "${debugPrint1}")`;
                    }
                    else if (arg0.name === "String") {
                        const exp = (0, writeExpression_1.writeExpression)(resolved[0], ctx);
                        return `${ctx.used(`__tact_debug_str`)}(${exp}, ${debugPrint2}, "${debugPrint1}")`;
                    }
                    else if (arg0.name === "Address") {
                        const exp = (0, writeExpression_1.writeExpression)(resolved[0], ctx);
                        return `${ctx.used(`__tact_debug_address`)}(${exp}, ${debugPrint2}, "${debugPrint1}")`;
                    }
                    else if (arg0.name === "Builder" ||
                        arg0.name === "Slice" ||
                        arg0.name === "Cell") {
                        const exp = (0, writeExpression_1.writeExpression)(resolved[0], ctx);
                        return `${ctx.used(`__tact_debug`)}(${exp}, ${debugPrint2}, "${debugPrint1}")`;
                    }
                    (0, errors_1.throwCompilationError)("dump() not supported for type: " + arg0.name, ref);
                }
                else {
                    (0, errors_1.throwCompilationError)("dump() not supported for argument", ref);
                }
            },
        },
    ],
    [
        "dumpStack",
        {
            name: "dumpStack",
            resolve: (_ctx, args, ref) => {
                if (args.length !== 0) {
                    (0, errors_1.throwCompilationError)("dumpStack expects no arguments", ref);
                }
                return { kind: "void" };
            },
            generate: (ctx, _args, _resolved, ref) => {
                if (!(0, features_1.enabledDebug)(ctx.ctx)) {
                    return `${ctx.used("__tact_nop")}()`;
                }
                const filePath = ref.file
                    ? (0, filePath_1.posixNormalize)(path_1.default.relative((0, process_1.cwd)(), ref.file))
                    : "unknown";
                const lineCol = ref.interval.getLineAndColumn();
                const debugPrint1 = `File ${filePath}:${lineCol.lineNum}:${lineCol.colNum}:`;
                return `${ctx.used(`__tact_debug_stack`)}("dumpStack()", "${debugPrint1}")`;
            },
        },
    ],
    [
        "emptyMap",
        {
            name: "emptyMap",
            resolve: (ctx, args, ref) => {
                if (args.length !== 0) {
                    (0, errors_1.throwCompilationError)("emptyMap expects no arguments", ref);
                }
                return { kind: "null" };
            },
            generate: (_ctx, _args, _resolved, _ref) => {
                return "null()";
            },
        },
    ],
    [
        "sha256",
        {
            name: "sha256",
            resolve: (ctx, args, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("sha256 expects 1 argument", ref);
                }
                const arg0 = args[0];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("sha256 expects string argument", ref);
                }
                if (arg0.name !== "String" && arg0.name !== "Slice") {
                    (0, errors_1.throwCompilationError)("sha256 expects string or slice argument", ref);
                }
                return { kind: "ref", name: "Int", optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("sha256 expects 1 argument", ref);
                }
                const arg0 = args[0];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("sha256 expects string argument", ref);
                }
                // String case
                if (arg0.name === "String") {
                    const resolved0 = resolved[0];
                    if ((0, ast_helpers_1.isLiteral)(resolved0)) {
                        // FIXME: This one does not need fixing, because it is carried out inside a "isLiteral" check.
                        // Remove this comment once the optimization step is added
                        const str = (0, interpreter_1.ensureSimplifiedString)(resolved0).value;
                        return (0, sha256_1.sha256)(str).value.toString(10);
                    }
                    // Otherwise, revert back to runtime hash through HASHEXT_SHA256
                    const exp = (0, writeExpression_1.writeExpression)(resolved[0], ctx);
                    return `__tact_sha256(${exp})`;
                }
                // Slice case
                if (arg0.name === "Slice") {
                    const exp = (0, writeExpression_1.writeExpression)(resolved[0], ctx);
                    return `__tact_sha256(${exp})`;
                }
                (0, errors_1.throwCompilationError)("sha256 expects string or slice argument", ref);
            },
        },
    ],
    [
        "slice",
        {
            name: "slice",
            resolve: (ctx, args, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("slice() expects one argument", ref);
                }
                const arg0 = args[0];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("slice() expects string argument", ref);
                }
                if (arg0.name !== "String") {
                    (0, errors_1.throwCompilationError)("slice() expects string argument", ref);
                }
                return { kind: "ref", name: "Slice", optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 1) {
                    (0, errors_1.throwCompilationError)("slice() expects one argument", ref);
                }
                // Load slice data
                const resolved0 = resolved[0];
                // FIXME: When optimizer step added, change the following line to:
                // const str = ensureSimplifiedString(resolved0).value;
                const str = (0, interpreter_1.interpretEscapeSequences)((0, interpreter_1.ensureString)(resolved0).value, resolved0.loc);
                let c;
                try {
                    c = core_1.Cell.fromBase64(str);
                }
                catch (_) {
                    (0, errors_1.throwCompilationError)(`Invalid slice ${str}`, ref);
                }
                const res = (0, writeConstant_1.writeSlice)(c.asSlice(), ctx);
                ctx.used(res);
                return `${res}()`;
            },
        },
    ],
    [
        "rawSlice",
        {
            name: "rawSlice",
            resolve: (ctx, args, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("rawSlice() expects one argument", ref);
                }
                const arg0 = args[0];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("rawSlice() expects string argument", ref);
                }
                if (arg0.name !== "String") {
                    (0, errors_1.throwCompilationError)("rawSlice() expects string argument", ref);
                }
                return { kind: "ref", name: "Slice", optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 1) {
                    (0, errors_1.throwCompilationError)("rawSlice() expects one argument", ref);
                }
                // Load slice data
                const resolved0 = resolved[0];
                // FIXME: When optimizer step added, change the following line to:
                // const str = ensureSimplifiedString(resolved0).value;
                const str = (0, interpreter_1.interpretEscapeSequences)((0, interpreter_1.ensureString)(resolved0).value, resolved0.loc);
                let c;
                try {
                    c = (0, core_1.beginCell)().storeBuffer(Buffer.from(str)).endCell();
                }
                catch (_) {
                    (0, errors_1.throwCompilationError)(`Invalid slice data ${str}`, ref);
                }
                const res = (0, writeConstant_1.writeSlice)(c.asSlice(), ctx);
                ctx.used(res);
                return `${res}()`;
            },
        },
    ],
    [
        "ascii",
        {
            name: "ascii",
            resolve: (ctx, args, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("ascii() expects one argument", ref);
                }
                const arg0 = args[0];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("ascii() expects string argument", ref);
                }
                if (arg0.name !== "String") {
                    (0, errors_1.throwCompilationError)("ascii() expects string argument", ref);
                }
                return { kind: "ref", name: "Int", optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 1) {
                    (0, errors_1.throwCompilationError)("ascii() expects one argument", ref);
                }
                // Load slice data
                const resolved0 = resolved[0];
                // FIXME: When optimizer step added, change the following line to:
                // const str = ensureSimplifiedString(resolved0).value;
                const str = (0, interpreter_1.interpretEscapeSequences)((0, interpreter_1.ensureString)(resolved0).value, resolved0.loc);
                if (str.length > 32) {
                    (0, errors_1.throwCompilationError)(`ascii() expects string argument with length <= 32`, ref);
                }
                return `"${str}"u`;
            },
        },
    ],
    [
        "crc32",
        {
            name: "crc32",
            resolve: (ctx, args, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("crc32() expects one argument", ref);
                }
                const arg0 = args[0];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("crc32() expects string argument", ref);
                }
                if (arg0.name !== "String") {
                    (0, errors_1.throwCompilationError)("crc32() expects string argument", ref);
                }
                return { kind: "ref", name: "Int", optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 1) {
                    (0, errors_1.throwCompilationError)("crc32() expects one argument", ref);
                }
                // Load slice data
                const resolved0 = resolved[0];
                // FIXME: When optimizer step added, change the following line to:
                // const str = ensureSimplifiedString(resolved0).value;
                const str = (0, interpreter_1.interpretEscapeSequences)((0, interpreter_1.ensureString)(resolved0).value, resolved0.loc);
                return `"${str}"c`;
            },
        },
    ],
]);
