"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructFunctions = void 0;
const ops_1 = require("../generator/writers/ops");
const writeExpression_1 = require("../generator/writers/writeExpression");
const errors_1 = require("../error/errors");
const resolveDescriptors_1 = require("../types/resolveDescriptors");
exports.StructFunctions = new Map([
    [
        "toCell",
        {
            name: "toCell",
            resolve: (ctx, args, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("toCell() expects no arguments", ref);
                }
                const arg = args[0];
                if (arg.kind !== "ref") {
                    (0, errors_1.throwCompilationError)(`toCell() is not implemented for type '${arg.kind}'`, ref);
                }
                const tp = (0, resolveDescriptors_1.getType)(ctx, arg.name);
                if (tp.kind !== "struct") {
                    (0, errors_1.throwCompilationError)(`toCell() is not implemented for type '${arg.kind}'`, ref);
                }
                return { kind: "ref", name: "Cell", optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 1) {
                    (0, errors_1.throwCompilationError)("toCell() expects no arguments", ref);
                }
                const arg = args[0];
                if (arg.kind !== "ref") {
                    (0, errors_1.throwCompilationError)(`toCell() is not implemented for type '${arg.kind}'`, ref);
                }
                return `${ops_1.ops.writerCell(arg.name, ctx)}(${resolved.map((v) => (0, writeExpression_1.writeExpression)(v, ctx)).join(", ")})`;
            },
        },
    ],
    [
        "fromCell",
        {
            name: "fromCell",
            resolve: (ctx, args, ref) => {
                if (args.length !== 2) {
                    (0, errors_1.throwCompilationError)("fromCell() expects one argument", ref);
                }
                const arg0 = args[0];
                const arg1 = args[1];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("fromCell() is implemented only for struct types", ref);
                }
                const tp = (0, resolveDescriptors_1.getType)(ctx, arg0.name);
                if (tp.kind !== "struct") {
                    (0, errors_1.throwCompilationError)("fromCell() is implemented only for struct types", ref);
                }
                if (arg1.kind !== "ref" || arg1.name !== "Cell") {
                    (0, errors_1.throwCompilationError)("fromCell() expects a Cell as an argument", ref);
                }
                return { kind: "ref", name: arg0.name, optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 2) {
                    (0, errors_1.throwCompilationError)("fromCell() expects one argument", ref);
                }
                const arg0 = args[0];
                const arg1 = args[1];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("fromCell() is implemented only for struct types", ref);
                }
                if (arg1.kind !== "ref" || arg1.name !== "Cell") {
                    (0, errors_1.throwCompilationError)("fromCell() expects a Cell as an argument", ref);
                }
                return `${ops_1.ops.readerNonModifying(arg0.name, ctx)}(${(0, writeExpression_1.writeExpression)(resolved[1], ctx)}.begin_parse())`;
            },
        },
    ],
    [
        "toSlice",
        {
            name: "toSlice",
            resolve: (ctx, args, ref) => {
                if (args.length !== 1) {
                    (0, errors_1.throwCompilationError)("toSlice() expects no arguments", ref);
                }
                const arg = args[0];
                if (arg.kind !== "ref") {
                    (0, errors_1.throwCompilationError)(`toSlice() is not implemented for type '${arg.kind}'`, ref);
                }
                const tp = (0, resolveDescriptors_1.getType)(ctx, arg.name);
                if (tp.kind !== "struct") {
                    (0, errors_1.throwCompilationError)(`toSlice() is not implemented for type '${arg.kind}'`, ref);
                }
                return { kind: "ref", name: "Slice", optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 1) {
                    (0, errors_1.throwCompilationError)("toSlice() expects no arguments", ref);
                }
                const arg = args[0];
                if (arg.kind !== "ref") {
                    (0, errors_1.throwCompilationError)(`toSlice() is not implemented for type '${arg.kind}'`, ref);
                }
                return `${ops_1.ops.writerCell(arg.name, ctx)}(${resolved.map((v) => (0, writeExpression_1.writeExpression)(v, ctx)).join(", ")}).begin_parse()`;
            },
        },
    ],
    [
        "fromSlice",
        {
            name: "fromSlice",
            resolve: (ctx, args, ref) => {
                if (args.length !== 2) {
                    (0, errors_1.throwCompilationError)("fromSlice() expects one argument", ref);
                }
                const arg0 = args[0];
                const arg1 = args[1];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("fromSlice() is implemented only for struct types", ref);
                }
                const tp = (0, resolveDescriptors_1.getType)(ctx, arg0.name);
                if (tp.kind !== "struct") {
                    (0, errors_1.throwCompilationError)("fromSlice() is implemented only for struct types", ref);
                }
                if (arg1.kind !== "ref" || arg1.name !== "Slice") {
                    (0, errors_1.throwCompilationError)("fromSlice() expects a Slice as an argument", ref);
                }
                return { kind: "ref", name: arg0.name, optional: false };
            },
            generate: (ctx, args, resolved, ref) => {
                if (resolved.length !== 2) {
                    (0, errors_1.throwCompilationError)("fromSlice() expects one argument", ref);
                }
                const arg0 = args[0];
                const arg1 = args[1];
                if (arg0.kind !== "ref") {
                    (0, errors_1.throwCompilationError)("fromSlice() is implemented only for struct types", ref);
                }
                if (arg1.kind !== "ref" || arg1.name !== "Slice") {
                    (0, errors_1.throwCompilationError)("fromSlice() expects a Slice as an argument", ref);
                }
                return `${ops_1.ops.readerNonModifying(arg0.name, ctx)}(${(0, writeExpression_1.writeExpression)(resolved[1], ctx)})`;
            },
        },
    ],
]);
