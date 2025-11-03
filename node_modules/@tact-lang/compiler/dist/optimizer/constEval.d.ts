import type { CompilerContext } from "../context/context";
import type * as A from "../ast/ast";
import type { AstUtil } from "../ast/util";
import type { InterpreterConfig } from "./interpreter";
import type { SrcInfo } from "../grammar";
export declare const getOptimizer: (util: AstUtil) => {
    partiallyEvalUnaryOp: (op: A.AstUnaryOperation, operand: A.AstExpression, source: SrcInfo, ctx: CompilerContext) => A.AstExpression;
    partiallyEvalBinaryOp: (op: A.AstBinaryOperation, left: A.AstExpression, right: A.AstExpression, source: SrcInfo, ctx: CompilerContext) => A.AstExpression;
    partiallyEvalExpression: (ast: A.AstExpression, ctx: CompilerContext, interpreterConfig?: InterpreterConfig) => A.AstExpression;
};
export declare function evalConstantExpression(ast: A.AstExpression, ctx: CompilerContext, util: AstUtil, interpreterConfig?: InterpreterConfig): A.AstLiteral;
