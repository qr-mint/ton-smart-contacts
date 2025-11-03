"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeValue = writeValue;
exports.writePathExpression = writePathExpression;
exports.writeExpression = writeExpression;
exports.writeTypescriptValue = writeTypescriptValue;
const errors_1 = require("../../error/errors");
const resolveExpression_1 = require("../../types/resolveExpression");
const resolveDescriptors_1 = require("../../types/resolveDescriptors");
const types_1 = require("../../types/types");
const resolveFuncTypeUnpack_1 = require("./resolveFuncTypeUnpack");
const map_1 = require("../../abi/map");
const global_1 = require("../../abi/global");
const id_1 = require("./id");
const struct_1 = require("../../abi/struct");
const resolveFuncType_1 = require("./resolveFuncType");
const writeConstant_1 = require("./writeConstant");
const ops_1 = require("./ops");
const writeFunction_1 = require("./writeFunction");
const resolveStatements_1 = require("../../types/resolveStatements");
const constEval_1 = require("../../optimizer/constEval");
const util_1 = require("../../ast/util");
const ast_helpers_1 = require("../../ast/ast-helpers");
const features_1 = require("../../config/features");
function isNull(wCtx, expr) {
    return (0, resolveExpression_1.getExpType)(wCtx.ctx, expr).kind === "null";
}
function writeStructConstructor(type, args, ctx) {
    // Check for duplicates
    const name = ops_1.ops.typeConstructor(type.name, args, ctx);
    const renderKey = "$constructor$" + type.name + "$" + args.join(",");
    if (ctx.isRendered(renderKey)) {
        return name;
    }
    ctx.markRendered(renderKey);
    // Generate constructor
    ctx.fun(name, () => {
        const funcType = (0, resolveFuncType_1.resolveFuncType)(type, ctx);
        // rename a struct constructor formal parameter to avoid
        // name clashes with FunC keywords, e.g. `struct Foo {type: Int}`
        // is a perfectly fine Tact structure, but its constructor would
        // have the wrong parameter name: `$Foo$_constructor_type(int type)`
        const avoidFunCKeywordNameClash = (p) => `$${p}`;
        const sig = `(${funcType}) ${name}(${args.map((v) => (0, resolveFuncType_1.resolveFuncType)(type.fields.find((v2) => v2.name === v).type, ctx) + " " + avoidFunCKeywordNameClash(v)).join(", ")})`;
        ctx.signature(sig);
        ctx.flag("inline");
        ctx.context("type:" + type.name);
        ctx.body(() => {
            // Create expressions
            const expressions = type.fields.map((v) => {
                const arg = args.find((v2) => v2 === v.name);
                if (arg) {
                    return avoidFunCKeywordNameClash(arg);
                }
                else if (v.default !== undefined) {
                    return writeValue(v.default, ctx);
                }
                else {
                    throw Error(`Missing argument for field "${v.name}" in struct "${type.name}"`); // Must not happen
                }
            }, ctx);
            if (expressions.length === 0 && funcType === "tuple") {
                ctx.append(`return empty_tuple();`);
            }
            else {
                ctx.append(`return (${expressions.join(", ")});`);
            }
        });
    });
    return name;
}
function writeValue(val, wCtx) {
    switch (val.kind) {
        case "number":
            return val.value.toString(10);
        case "simplified_string": {
            const id = (0, writeConstant_1.writeString)(val.value, wCtx);
            wCtx.used(id);
            return `${id}()`;
        }
        case "boolean":
            return val.value ? "true" : "false";
        case "address": {
            const res = (0, writeConstant_1.writeAddress)(val.value, wCtx);
            wCtx.used(res);
            return res + "()";
        }
        case "cell": {
            const res = (0, writeConstant_1.writeCell)(val.value, wCtx);
            wCtx.used(res);
            return `${res}()`;
        }
        case "slice": {
            const res = (0, writeConstant_1.writeSlice)(val.value, wCtx);
            wCtx.used(res);
            return `${res}()`;
        }
        case "null":
            return "null()";
        case "struct_value": {
            // Transform the struct fields into a map for lookup
            const valMap = new Map();
            for (const f of val.args) {
                valMap.set((0, ast_helpers_1.idText)(f.field), f.initializer);
            }
            const structDescription = (0, resolveDescriptors_1.getType)(wCtx.ctx, val.type);
            const fields = structDescription.fields.map((field) => field.name);
            const id = writeStructConstructor(structDescription, fields, wCtx);
            wCtx.used(id);
            const fieldValues = structDescription.fields.map((field) => {
                if (valMap.has(field.name)) {
                    const v = valMap.get(field.name);
                    if (field.type.kind === "ref" && field.type.optional) {
                        const ft = (0, resolveDescriptors_1.getType)(wCtx.ctx, field.type.name);
                        if (ft.kind === "struct" && v.kind !== "null") {
                            return `${ops_1.ops.typeAsOptional(ft.name, wCtx)}(${writeValue(v, wCtx)})`;
                        }
                    }
                    return writeValue(v, wCtx);
                }
                else {
                    (0, errors_1.throwInternalCompilerError)(`Struct value is missing a field: ${field.name}`, val.loc);
                }
            });
            return `${id}(${fieldValues.join(", ")})`;
        }
        default:
            (0, errors_1.throwInternalCompilerError)("Unrecognized ast literal kind");
    }
}
function writePathExpression(path) {
    return [(0, id_1.funcIdOf)((0, ast_helpers_1.idText)(path[0])), ...path.slice(1).map(ast_helpers_1.idText)].join(`'`);
}
function writeExpression(f, wCtx) {
    // literals and constant expressions are covered here
    // FIXME: Once optimization step is added, remove this try and replace it with this
    // conditional:
    // if (isLiteral(f)) {
    //    return writeValue(f, wCtx);
    // }
    try {
        const util = (0, util_1.getAstUtil)((0, ast_helpers_1.getAstFactory)());
        // Let us put a limit of 2 ^ 12 = 4096 iterations on loops to increase compiler responsiveness.
        // If a loop takes more than such number of iterations, the interpreter will fail evaluation.
        // I think maxLoopIterations should be a command line option in case a user wants to wait more
        // during evaluation.
        const value = (0, constEval_1.evalConstantExpression)(f, wCtx.ctx, util, {
            maxLoopIterations: 2n ** 12n,
        });
        return writeValue(value, wCtx);
    }
    catch (error) {
        if (!(error instanceof errors_1.TactConstEvalError) || error.fatal)
            throw error;
    }
    //
    // ID Reference
    //
    if (f.kind === "id") {
        const t = (0, resolveExpression_1.getExpType)(wCtx.ctx, f);
        // Handle packed type
        if (t.kind === "ref") {
            const tt = (0, resolveDescriptors_1.getType)(wCtx.ctx, t.name);
            if (tt.kind === "contract" || tt.kind === "struct") {
                return (0, resolveFuncTypeUnpack_1.resolveFuncTypeUnpack)(t, (0, id_1.funcIdOf)(f.text), wCtx);
            }
        }
        if (t.kind === "ref_bounced") {
            const tt = (0, resolveDescriptors_1.getType)(wCtx.ctx, t.name);
            if (tt.kind === "struct") {
                return (0, resolveFuncTypeUnpack_1.resolveFuncTypeUnpack)(t, (0, id_1.funcIdOf)(f.text), wCtx, false, true);
            }
        }
        // Handle constant
        if ((0, resolveDescriptors_1.hasStaticConstant)(wCtx.ctx, f.text)) {
            const c = (0, resolveDescriptors_1.getStaticConstant)(wCtx.ctx, f.text);
            return writeValue(c.value, wCtx);
        }
        return (0, id_1.funcIdOf)(f.text);
    }
    // NOTE: We always wrap expressions in parentheses to avoid operator precedence issues
    if (f.kind === "op_binary") {
        // Special case for non-integer types and nullable
        if (f.op === "==" || f.op === "!=") {
            if (isNull(wCtx, f.left) && isNull(wCtx, f.right)) {
                if (f.op === "==") {
                    return "true";
                }
                else {
                    return "false";
                }
            }
            else if (isNull(wCtx, f.left) && !isNull(wCtx, f.right)) {
                if (f.op === "==") {
                    return `null?(${writeExpression(f.right, wCtx)})`;
                }
                else {
                    return `(~ null?(${writeExpression(f.right, wCtx)}))`;
                }
            }
            else if (!isNull(wCtx, f.left) && isNull(wCtx, f.right)) {
                if (f.op === "==") {
                    return `null?(${writeExpression(f.left, wCtx)})`;
                }
                else {
                    return `(~ null?(${writeExpression(f.left, wCtx)}))`;
                }
            }
        }
        // Special case for address
        const lt = (0, resolveExpression_1.getExpType)(wCtx.ctx, f.left);
        const rt = (0, resolveExpression_1.getExpType)(wCtx.ctx, f.right);
        // Case for addresses equality
        if (lt.kind === "ref" &&
            rt.kind === "ref" &&
            lt.name === "Address" &&
            rt.name === "Address") {
            const prefix = f.op == "!=" ? "~ " : "";
            if (lt.optional && rt.optional) {
                wCtx.used(`__tact_slice_eq_bits_nullable`);
                return `( ${prefix}__tact_slice_eq_bits_nullable(${writeExpression(f.left, wCtx)}, ${writeExpression(f.right, wCtx)}) )`;
            }
            if (lt.optional && !rt.optional) {
                wCtx.used(`__tact_slice_eq_bits_nullable_one`);
                return `( ${prefix}__tact_slice_eq_bits_nullable_one(${writeExpression(f.left, wCtx)}, ${writeExpression(f.right, wCtx)}) )`;
            }
            if (!lt.optional && rt.optional) {
                wCtx.used(`__tact_slice_eq_bits_nullable_one`);
                return `( ${prefix}__tact_slice_eq_bits_nullable_one(${writeExpression(f.right, wCtx)}, ${writeExpression(f.left, wCtx)}) )`;
            }
            return `( ${prefix}equal_slices_bits(${writeExpression(f.right, wCtx)}, ${writeExpression(f.left, wCtx)}) )`;
        }
        // Case for cells equality
        if (lt.kind === "ref" &&
            rt.kind === "ref" &&
            lt.name === "Cell" &&
            rt.name === "Cell") {
            const op = f.op === "==" ? "eq" : "neq";
            if (lt.optional && rt.optional) {
                wCtx.used(`__tact_cell_${op}_nullable`);
                return `__tact_cell_${op}_nullable(${writeExpression(f.left, wCtx)}, ${writeExpression(f.right, wCtx)})`;
            }
            if (lt.optional && !rt.optional) {
                wCtx.used(`__tact_cell_${op}_nullable_one`);
                return `__tact_cell_${op}_nullable_one(${writeExpression(f.left, wCtx)}, ${writeExpression(f.right, wCtx)})`;
            }
            if (!lt.optional && rt.optional) {
                wCtx.used(`__tact_cell_${op}_nullable_one`);
                return `__tact_cell_${op}_nullable_one(${writeExpression(f.right, wCtx)}, ${writeExpression(f.left, wCtx)})`;
            }
            wCtx.used(`__tact_cell_${op}`);
            return `__tact_cell_${op}(${writeExpression(f.right, wCtx)}, ${writeExpression(f.left, wCtx)})`;
        }
        // Case for slices and strings equality
        if (lt.kind === "ref" &&
            rt.kind === "ref" &&
            lt.name === rt.name &&
            (lt.name === "Slice" || lt.name === "String")) {
            const op = f.op === "==" ? "eq" : "neq";
            if (lt.optional && rt.optional) {
                wCtx.used(`__tact_slice_${op}_nullable`);
                return `__tact_slice_${op}_nullable(${writeExpression(f.left, wCtx)}, ${writeExpression(f.right, wCtx)})`;
            }
            if (lt.optional && !rt.optional) {
                wCtx.used(`__tact_slice_${op}_nullable_one`);
                return `__tact_slice_${op}_nullable_one(${writeExpression(f.left, wCtx)}, ${writeExpression(f.right, wCtx)})`;
            }
            if (!lt.optional && rt.optional) {
                wCtx.used(`__tact_slice_${op}_nullable_one`);
                return `__tact_slice_${op}_nullable_one(${writeExpression(f.right, wCtx)}, ${writeExpression(f.left, wCtx)})`;
            }
            wCtx.used(`__tact_slice_${op}`);
            return `__tact_slice_${op}(${writeExpression(f.right, wCtx)}, ${writeExpression(f.left, wCtx)})`;
        }
        // Case for maps equality
        if (lt.kind === "map" && rt.kind === "map") {
            const op = f.op === "==" ? "eq" : "neq";
            wCtx.used(`__tact_cell_${op}_nullable`);
            return `__tact_cell_${op}_nullable(${writeExpression(f.left, wCtx)}, ${writeExpression(f.right, wCtx)})`;
        }
        // Check for int or boolean types
        if (lt.kind !== "ref" ||
            rt.kind !== "ref" ||
            (lt.name !== "Int" && lt.name !== "Bool") ||
            (rt.name !== "Int" && rt.name !== "Bool")) {
            const file = f.loc.file;
            const loc_info = f.loc.interval.getLineAndColumn();
            throw Error(`(Internal Compiler Error) Invalid types for binary operation: ${file}:${loc_info.lineNum}:${loc_info.colNum}`); // Should be unreachable
        }
        // Case for ints equality
        if (f.op === "==" || f.op === "!=") {
            const op = f.op === "==" ? "eq" : "neq";
            if (lt.optional && rt.optional) {
                wCtx.used(`__tact_int_${op}_nullable`);
                return `__tact_int_${op}_nullable(${writeExpression(f.left, wCtx)}, ${writeExpression(f.right, wCtx)})`;
            }
            if (lt.optional && !rt.optional) {
                wCtx.used(`__tact_int_${op}_nullable_one`);
                return `__tact_int_${op}_nullable_one(${writeExpression(f.left, wCtx)}, ${writeExpression(f.right, wCtx)})`;
            }
            if (!lt.optional && rt.optional) {
                wCtx.used(`__tact_int_${op}_nullable_one`);
                return `__tact_int_${op}_nullable_one(${writeExpression(f.right, wCtx)}, ${writeExpression(f.left, wCtx)})`;
            }
            if (f.op === "==") {
                return `(${writeExpression(f.left, wCtx)} == ${writeExpression(f.right, wCtx)})`;
            }
            else {
                return `(${writeExpression(f.left, wCtx)} != ${writeExpression(f.right, wCtx)})`;
            }
        }
        // Case for "&&" operator
        if (f.op === "&&") {
            return `( (${writeExpression(f.left, wCtx)}) ? (${writeExpression(f.right, wCtx)}) : (false) )`;
        }
        // Case for "||" operator
        if (f.op === "||") {
            return `( (${writeExpression(f.left, wCtx)}) ? (true) : (${writeExpression(f.right, wCtx)}) )`;
        }
        // Other ops
        return ("(" +
            writeExpression(f.left, wCtx) +
            " " +
            f.op +
            " " +
            writeExpression(f.right, wCtx) +
            ")");
    }
    //
    // Unary operations: !, -, +, !!
    // NOTE: We always wrap expressions in parentheses to avoid operator precedence issues
    //
    if (f.kind === "op_unary") {
        // NOTE: Logical not is written as a bitwise not
        switch (f.op) {
            case "!": {
                return "(~ " + writeExpression(f.operand, wCtx) + ")";
            }
            case "~": {
                return "(~ " + writeExpression(f.operand, wCtx) + ")";
            }
            case "-": {
                return "(- " + writeExpression(f.operand, wCtx) + ")";
            }
            case "+": {
                return "(+ " + writeExpression(f.operand, wCtx) + ")";
            }
            // NOTE: Assert function that ensures that the value is not null
            case "!!": {
                const t = (0, resolveExpression_1.getExpType)(wCtx.ctx, f.operand);
                if (t.kind === "ref") {
                    const tt = (0, resolveDescriptors_1.getType)(wCtx.ctx, t.name);
                    if (tt.kind === "struct") {
                        return `${ops_1.ops.typeNotNull(tt.name, wCtx)}(${writeExpression(f.operand, wCtx)})`;
                    }
                }
                if ((0, features_1.enabledNullChecks)(wCtx.ctx) || (0, features_1.enabledDebug)(wCtx.ctx)) {
                    wCtx.used("__tact_not_null");
                    return `${wCtx.used("__tact_not_null")}(${writeExpression(f.operand, wCtx)})`;
                }
                else {
                    return writeExpression(f.operand, wCtx);
                }
            }
        }
    }
    //
    // Field Access
    // NOTE: this branch resolves "a.b", where "a" is an expression and "b" is a field name
    //
    if (f.kind === "field_access") {
        // Resolve the type of the expression
        const src = (0, resolveExpression_1.getExpType)(wCtx.ctx, f.aggregate);
        if ((src.kind !== "ref" || src.optional) &&
            src.kind !== "ref_bounced") {
            (0, errors_1.throwCompilationError)(`Cannot access field of non-struct type: "${(0, types_1.printTypeRef)(src)}"`, f.loc);
        }
        const srcT = (0, resolveDescriptors_1.getType)(wCtx.ctx, src.name);
        // Resolve field
        let fields;
        fields = srcT.fields;
        if (src.kind === "ref_bounced") {
            fields = fields.slice(0, srcT.partialFieldCount);
        }
        const field = fields.find((v) => (0, ast_helpers_1.eqNames)(v.name, f.field));
        const cst = srcT.constants.find((v) => (0, ast_helpers_1.eqNames)(v.name, f.field));
        if (!field && !cst) {
            (0, errors_1.throwCompilationError)(`Cannot find field ${(0, errors_1.idTextErr)(f.field)} in struct ${(0, errors_1.idTextErr)(srcT.name)}`, f.field.loc);
        }
        if (field) {
            // Trying to resolve field as a path
            const path = (0, ast_helpers_1.tryExtractPath)(f);
            if (path) {
                // Prepare path
                const idd = writePathExpression(path);
                // Special case for structs
                if (field.type.kind === "ref") {
                    const ft = (0, resolveDescriptors_1.getType)(wCtx.ctx, field.type.name);
                    if (ft.kind === "struct" || ft.kind === "contract") {
                        return (0, resolveFuncTypeUnpack_1.resolveFuncTypeUnpack)(field.type, idd, wCtx);
                    }
                }
                return idd;
            }
            // Getter instead of direct field access
            return `${ops_1.ops.typeField(srcT.name, field.name, wCtx)}(${writeExpression(f.aggregate, wCtx)})`;
        }
        else {
            return writeValue(cst.value, wCtx);
        }
    }
    //
    // Static Function Call
    //
    if (f.kind === "static_call") {
        // Check global functions
        if (global_1.GlobalFunctions.has((0, ast_helpers_1.idText)(f.function))) {
            return global_1.GlobalFunctions.get((0, ast_helpers_1.idText)(f.function)).generate(wCtx, f.args.map((v) => (0, resolveExpression_1.getExpType)(wCtx.ctx, v)), f.args, f.loc);
        }
        const sf = (0, resolveDescriptors_1.getStaticFunction)(wCtx.ctx, (0, ast_helpers_1.idText)(f.function));
        let n = ops_1.ops.global((0, ast_helpers_1.idText)(f.function));
        if (sf.ast.kind === "native_function_decl") {
            n = (0, ast_helpers_1.idText)(sf.ast.nativeName);
            if (n.startsWith("__tact")) {
                wCtx.used(n);
            }
        }
        else {
            wCtx.used(n);
        }
        return (n +
            "(" +
            f.args
                .map((a, i) => (0, writeFunction_1.writeCastedExpression)(a, sf.params[i].type, wCtx))
                .join(", ") +
            ")");
    }
    //
    // Struct Constructor
    //
    if (f.kind === "struct_instance") {
        const src = (0, resolveDescriptors_1.getType)(wCtx.ctx, f.type);
        // Write a constructor
        const id = writeStructConstructor(src, f.args.map((v) => (0, ast_helpers_1.idText)(v.field)), wCtx);
        wCtx.used(id);
        // Write an expression
        const expressions = f.args.map((v) => (0, writeFunction_1.writeCastedExpression)(v.initializer, src.fields.find((v2) => (0, ast_helpers_1.eqNames)(v2.name, v.field)).type, wCtx), wCtx);
        return `${id}(${expressions.join(", ")})`;
    }
    //
    // Object-based function call
    //
    if (f.kind === "method_call") {
        // Resolve source type
        const selfTyRef = (0, resolveExpression_1.getExpType)(wCtx.ctx, f.self);
        // Reference type
        if (selfTyRef.kind === "ref") {
            // Render function call
            const selfTy = (0, resolveDescriptors_1.getType)(wCtx.ctx, selfTyRef.name);
            // Check struct ABI
            if (selfTy.kind === "struct") {
                if (struct_1.StructFunctions.has((0, ast_helpers_1.idText)(f.method))) {
                    const abi = struct_1.StructFunctions.get((0, ast_helpers_1.idText)(f.method));
                    return abi.generate(wCtx, [
                        selfTyRef,
                        ...f.args.map((v) => (0, resolveExpression_1.getExpType)(wCtx.ctx, v)),
                    ], [f.self, ...f.args], f.loc);
                }
            }
            // Resolve function
            const methodDescr = selfTy.functions.get((0, ast_helpers_1.idText)(f.method));
            let name = ops_1.ops.extension(selfTyRef.name, (0, ast_helpers_1.idText)(f.method));
            if (methodDescr.ast.kind === "function_def" ||
                methodDescr.ast.kind === "function_decl" ||
                methodDescr.ast.kind === "asm_function_def") {
                wCtx.used(name);
            }
            else {
                name = (0, ast_helpers_1.idText)(methodDescr.ast.nativeName);
                if (name.startsWith("__tact")) {
                    wCtx.used(name);
                }
            }
            // Render arguments
            let renderedArguments = f.args.map((a, i) => (0, writeFunction_1.writeCastedExpression)(a, methodDescr.params[i].type, wCtx));
            // Hack to replace a single struct argument to a tensor wrapper since otherwise
            // func would convert (int) type to just int and break mutating functions
            if (methodDescr.isMutating) {
                if (f.args.length === 1) {
                    const t = (0, resolveExpression_1.getExpType)(wCtx.ctx, f.args[0]);
                    if (t.kind === "ref") {
                        const tt = (0, resolveDescriptors_1.getType)(wCtx.ctx, t.name);
                        if ((tt.kind === "contract" || tt.kind === "struct") &&
                            methodDescr.params[0].type.kind === "ref" &&
                            !methodDescr.params[0].type.optional) {
                            renderedArguments = [
                                `${ops_1.ops.typeTensorCast(tt.name, wCtx)}(${renderedArguments[0]})`,
                            ];
                        }
                    }
                }
            }
            const s = (0, writeFunction_1.writeCastedExpression)(f.self, methodDescr.self, wCtx);
            if (methodDescr.isMutating) {
                // check if it's an l-value
                const path = (0, ast_helpers_1.tryExtractPath)(f.self);
                if (path !== null && (0, resolveStatements_1.isLvalue)(path, wCtx.ctx)) {
                    return `${s}~${name}(${renderedArguments.join(", ")})`;
                }
                else {
                    return `${wCtx.used(ops_1.ops.nonModifying(name))}(${[s, ...renderedArguments].join(", ")})`;
                }
            }
            else {
                // Rearranges the arguments in the order described in Asm Shuffle
                //
                // For example:
                // `asm(other self) fun foo(self: Type, other: Type2)` and
                // `foo(10, 20)` generates as
                // `foo(20, 10)`
                if (methodDescr.ast.kind === "asm_function_def" &&
                    methodDescr.self &&
                    methodDescr.ast.shuffle.args.length > 1 &&
                    methodDescr.ast.shuffle.ret.length === 0) {
                    const renderedSelfAndArguments = [s, ...renderedArguments];
                    const selfAndParameters = [
                        "self",
                        ...methodDescr.params.map((p) => (0, ast_helpers_1.idText)(p.name)),
                    ];
                    const shuffledArgs = methodDescr.ast.shuffle.args.map((shuffleArg) => {
                        const i = selfAndParameters.indexOf((0, ast_helpers_1.idText)(shuffleArg));
                        return renderedSelfAndArguments[i];
                    });
                    return `${name}(${shuffledArgs.join(", ")})`;
                }
                return `${name}(${[s, ...renderedArguments].join(", ")})`;
            }
        }
        // Map types
        if (selfTyRef.kind === "map") {
            if (!map_1.MapFunctions.has((0, ast_helpers_1.idText)(f.method))) {
                (0, errors_1.throwCompilationError)(`Map function "${(0, ast_helpers_1.idText)(f.method)}" not found`, f.loc);
            }
            const abf = map_1.MapFunctions.get((0, ast_helpers_1.idText)(f.method));
            return abf.generate(wCtx, [selfTyRef, ...f.args.map((v) => (0, resolveExpression_1.getExpType)(wCtx.ctx, v))], [f.self, ...f.args], f.loc);
        }
        if (selfTyRef.kind === "ref_bounced") {
            throw Error("Unimplemented");
        }
        (0, errors_1.throwCompilationError)(`Cannot call function of non - direct type: "${(0, types_1.printTypeRef)(selfTyRef)}"`, f.loc);
    }
    //
    // Init of
    //
    if (f.kind === "init_of") {
        const type = (0, resolveDescriptors_1.getType)(wCtx.ctx, f.contract);
        const initArgs = f.args.map((a, i) => (0, writeFunction_1.writeCastedExpression)(a, type.init.params[i].type, wCtx));
        return `${ops_1.ops.contractInitChild((0, ast_helpers_1.idText)(f.contract), wCtx)}(${initArgs.join(", ")})`;
    }
    //
    // Code of
    //
    if (f.kind === "code_of") {
        // In case of using `codeOf T` in contract `T`, we simply use MYCODE.
        if (wCtx.name === f.contract.text) {
            return `my_code()`;
        }
        return `${ops_1.ops.contractCodeChild((0, ast_helpers_1.idText)(f.contract), wCtx)}()`;
    }
    //
    // Ternary operator
    //
    if (f.kind === "conditional") {
        return `(${writeExpression(f.condition, wCtx)} ? ${writeExpression(f.thenBranch, wCtx)} : ${writeExpression(f.elseBranch, wCtx)})`;
    }
    //
    // Unreachable
    //
    throw Error("Unknown expression");
}
function writeTypescriptValue(val) {
    if (typeof val === "undefined")
        return undefined;
    switch (val.kind) {
        case "number":
            return val.value.toString(10) + "n";
        case "simplified_string":
            return JSON.stringify(val.value);
        case "boolean":
            return val.value ? "true" : "false";
        case "address":
            return `address("${val.value.toString()}")`;
        case "cell":
            return `Cell.fromHex("${val.value.toBoc().toString("hex")}")`;
        case "slice":
            return `Cell.fromHex("${val.value.asCell().toBoc().toString("hex")}").beginParse()`;
        case "null":
            return "null";
        case "struct_value": {
            const typeName = val.type.text;
            const args = val.args
                .map((it) => it.field.text +
                ": " +
                writeTypescriptValue(it.initializer))
                .join(", ");
            return `{ $$type: "${typeName}" as const, ${args} }`;
        }
    }
}
