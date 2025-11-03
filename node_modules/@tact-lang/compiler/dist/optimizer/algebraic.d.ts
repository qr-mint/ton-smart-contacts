import type * as A from "../ast/ast";
import type { ExpressionTransformer } from "./types";
import { Rule } from "./types";
export declare class AddZero extends Rule {
    private additiveOperators;
    applyRule(ast: A.AstExpression, { util }: ExpressionTransformer): A.AstExpression;
}
export declare class MultiplyZero extends Rule {
    applyRule(ast: A.AstExpression, { util }: ExpressionTransformer): A.AstExpression;
}
export declare class MultiplyOne extends Rule {
    applyRule(ast: A.AstExpression, _optimizer: ExpressionTransformer): A.AstExpression;
}
export declare class SubtractSelf extends Rule {
    applyRule(ast: A.AstExpression, { util }: ExpressionTransformer): A.AstExpression;
}
export declare class AddSelf extends Rule {
    applyRule(ast: A.AstExpression, { applyRules, util }: ExpressionTransformer): A.AstExpression;
}
export declare class OrTrue extends Rule {
    applyRule(ast: A.AstExpression, { util }: ExpressionTransformer): A.AstExpression;
}
export declare class AndFalse extends Rule {
    applyRule(ast: A.AstExpression, { util }: ExpressionTransformer): A.AstExpression;
}
export declare class OrFalse extends Rule {
    applyRule(ast: A.AstExpression, _optimizer: ExpressionTransformer): A.AstExpression;
}
export declare class AndTrue extends Rule {
    applyRule(ast: A.AstExpression, _optimizer: ExpressionTransformer): A.AstExpression;
}
export declare class OrSelf extends Rule {
    applyRule(ast: A.AstExpression, _optimizer: ExpressionTransformer): A.AstExpression;
}
export declare class AndSelf extends Rule {
    applyRule(ast: A.AstExpression, _optimizer: ExpressionTransformer): A.AstExpression;
}
export declare class ExcludedMiddle extends Rule {
    applyRule(ast: A.AstExpression, { util }: ExpressionTransformer): A.AstExpression;
}
export declare class Contradiction extends Rule {
    applyRule(ast: A.AstExpression, { util }: ExpressionTransformer): A.AstExpression;
}
export declare class DoubleNegation extends Rule {
    applyRule(ast: A.AstExpression, _optimizer: ExpressionTransformer): A.AstExpression;
}
export declare class NegateTrue extends Rule {
    applyRule(ast: A.AstExpression, { util }: ExpressionTransformer): A.AstExpression;
}
export declare class NegateFalse extends Rule {
    applyRule(ast: A.AstExpression, { util }: ExpressionTransformer): A.AstExpression;
}
