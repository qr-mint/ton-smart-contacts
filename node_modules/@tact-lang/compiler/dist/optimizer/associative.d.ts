import type { SrcInfo } from "../grammar";
import type * as A from "../ast/ast";
import type { ExpressionTransformer } from "./types";
import { Rule } from "./types";
import type { AstUtil } from "../ast/util";
type TransformData = {
    simplifiedExpression: A.AstExpression;
    safetyCondition: boolean;
};
type Transform = (x1: A.AstExpression, c1: A.AstLiteral, c2: A.AstLiteral, util: AstUtil, s: SrcInfo) => TransformData;
declare abstract class AssociativeRewriteRule extends Rule {
    private associativeOps;
    private commutativeOps;
    constructor();
    areAssociative(op1: A.AstBinaryOperation, op2: A.AstBinaryOperation): boolean;
    isCommutative(op: A.AstBinaryOperation): boolean;
}
declare abstract class AllowableOpRule extends AssociativeRewriteRule {
    private allowedOps;
    constructor();
    isAllowedOp(op: A.AstBinaryOperation): boolean;
    areAllowedOps(op: A.AstBinaryOperation[]): boolean;
}
export declare class AssociativeRule1 extends AllowableOpRule {
    applyRule(ast: A.AstExpression, { applyRules, util }: ExpressionTransformer): A.AstExpression;
}
export declare class AssociativeRule2 extends AllowableOpRule {
    applyRule(ast: A.AstExpression, { applyRules, util }: ExpressionTransformer): A.AstExpression;
}
export declare class AssociativeRule3 extends Rule {
    private leftAssocTransforms;
    private rightAssocTransforms;
    private rightCommuteTransforms;
    private leftCommuteTransforms;
    private standardAdditiveCondition;
    private shiftedAdditiveCondition;
    private oppositeAdditiveCondition;
    private standardMultiplicativeCondition;
    constructor();
    private lookupTransform;
    protected getLeftAssociativityTransform(keyOp1: A.AstBinaryOperation, keyOp2: A.AstBinaryOperation): Transform | undefined;
    protected getRightAssociativityTransform(keyOp1: A.AstBinaryOperation, keyOp2: A.AstBinaryOperation): Transform | undefined;
    protected getLeftCommutativityTransform(keyOp1: A.AstBinaryOperation, keyOp2: A.AstBinaryOperation): Transform | undefined;
    protected getRightCommutativityTransform(keyOp1: A.AstBinaryOperation, keyOp2: A.AstBinaryOperation): Transform | undefined;
    applyRule(ast: A.AstExpression, { applyRules, util }: ExpressionTransformer): A.AstExpression;
}
export {};
