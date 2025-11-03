"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptimizer = void 0;
exports.evalConstantExpression = evalConstantExpression;
const ast_helpers_1 = require("../ast/ast-helpers");
const errors_1 = require("../error/errors");
const standardOptimizer_1 = require("./standardOptimizer");
const interpreter_1 = require("./interpreter");
// Utility Exception class to interrupt the execution
// of functions that cannot evaluate a tree fully into a value.
class PartiallyEvaluatedTree extends Error {
    tree;
    constructor(tree) {
        super();
        this.tree = tree;
    }
}
const getOptimizer = (util) => {
    // The optimizer that applies the rewriting rules during partial evaluation.
    // For the moment we use an optimizer that respects overflows.
    const optimizer = new standardOptimizer_1.StandardOptimizer(util);
    function partiallyEvalUnaryOp(op, operand, source, ctx) {
        if (operand.kind === "number" && op === "-") {
            // emulating negative integer literals
            return (0, interpreter_1.ensureInt)(util.makeNumberLiteral(-operand.value, source));
        }
        const simplOperand = partiallyEvalExpression(operand, ctx);
        if ((0, ast_helpers_1.isLiteral)(simplOperand)) {
            const result = (0, interpreter_1.evalUnaryOp)(op, simplOperand, source, util);
            return result;
        }
        else {
            const newAst = util.makeUnaryExpression(op, simplOperand);
            return optimizer.applyRules(newAst);
        }
    }
    function partiallyEvalBinaryOp(op, left, right, source, ctx) {
        const leftOperand = partiallyEvalExpression(left, ctx);
        if ((0, ast_helpers_1.isLiteral)(leftOperand)) {
            // Because of short-circuiting, we must delay evaluation of the right operand
            try {
                const result = (0, interpreter_1.evalBinaryOp)(op, leftOperand, 
                // We delay the evaluation of the right operand inside a continuation
                () => {
                    const rightOperand = partiallyEvalExpression(right, ctx);
                    if ((0, ast_helpers_1.isLiteral)(rightOperand)) {
                        // If the right operand reduced to a value, then we can let the function
                        // evalBinaryOp finish its normal execution by returning the
                        // right operand.
                        return rightOperand;
                    }
                    else {
                        // If the right operand does not reduce to a value,<
                        // we interrupt the execution of the evalBinaryOp function
                        // by returning an exception with the partially evaluated right operand.
                        // The simplification rules will handle the partially evaluated tree in the catch
                        // of the try surrounding the evalBinaryOp function.
                        throw new PartiallyEvaluatedTree(rightOperand);
                    }
                }, source, util);
                return result;
            }
            catch (e) {
                if (e instanceof PartiallyEvaluatedTree) {
                    // The right operand did not evaluate to a value. Hence,
                    // time to symbolically simplify the full tree.
                    const newAst = util.makeBinaryExpression(op, leftOperand, e.tree);
                    return optimizer.applyRules(newAst);
                }
                else {
                    throw e;
                }
            }
        }
        else {
            // Since the left operand does not reduce to a value, no immediate short-circuiting will occur.
            // Hence, we can partially evaluate the right operand and let the rules
            // simplify the tree.
            const rightOperand = partiallyEvalExpression(right, ctx);
            const newAst = util.makeBinaryExpression(op, leftOperand, rightOperand);
            return optimizer.applyRules(newAst);
        }
    }
    // FIXME: Refactor this method in a separate PR because many cases in the switch do the same.
    function partiallyEvalExpression(ast, ctx, interpreterConfig) {
        const interpreter = new interpreter_1.Interpreter(util, ctx, interpreterConfig);
        switch (ast.kind) {
            case "id":
                try {
                    return interpreter.interpretExpression(ast);
                }
                catch (e) {
                    if (e instanceof errors_1.TactConstEvalError) {
                        if (!e.fatal) {
                            // If a non-fatal error occurs during lookup, just return the symbol
                            return ast;
                        }
                    }
                    throw e;
                }
            case "method_call":
                // Does not partially evaluate at the moment. Will attempt to fully evaluate
                return interpreter.interpretExpression(ast);
            case "init_of":
                (0, interpreter_1.throwNonFatalErrorConstEval)("initOf is not supported at this moment", ast.loc);
                break;
            case "code_of":
                (0, interpreter_1.throwNonFatalErrorConstEval)("codeOf is not supported at this moment", ast.loc);
                break;
            case "null":
                return ast;
            case "boolean":
                return ast;
            case "number":
                return interpreter.interpretExpression(ast);
            case "string":
                return interpreter.interpretExpression(ast);
            case "simplified_string":
                return ast;
            case "struct_value":
                return ast;
            case "address":
                return ast;
            case "cell":
                return ast;
            case "slice":
                return ast;
            case "op_unary":
                return partiallyEvalUnaryOp(ast.op, ast.operand, ast.loc, ctx);
            case "op_binary":
                return partiallyEvalBinaryOp(ast.op, ast.left, ast.right, ast.loc, ctx);
            case "conditional":
                // Does not partially evaluate at the moment. Will attempt to fully evaluate
                return interpreter.interpretExpression(ast);
            case "struct_instance":
                // Does not partially evaluate at the moment. Will attempt to fully evaluate
                return interpreter.interpretExpression(ast);
            case "field_access":
                // Does not partially evaluate at the moment. Will attempt to fully evaluate
                return interpreter.interpretExpression(ast);
            case "static_call":
                // Does not partially evaluate at the moment. Will attempt to fully evaluate
                return interpreter.interpretExpression(ast);
            default:
                (0, errors_1.throwInternalCompilerError)("Unrecognized expression kind");
        }
    }
    return {
        partiallyEvalUnaryOp,
        partiallyEvalBinaryOp,
        partiallyEvalExpression,
    };
};
exports.getOptimizer = getOptimizer;
function evalConstantExpression(ast, ctx, util, interpreterConfig) {
    const interpreter = new interpreter_1.Interpreter(util, ctx, interpreterConfig);
    const result = interpreter.interpretExpression(ast);
    return result;
}
