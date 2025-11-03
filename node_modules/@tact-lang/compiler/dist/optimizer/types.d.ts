import type { AstExpression } from "../ast/ast";
import type { AstUtil } from "../ast/util";
export interface ExpressionTransformer {
    util: AstUtil;
    applyRules(ast: AstExpression): AstExpression;
}
export declare abstract class Rule {
    abstract applyRule(ast: AstExpression, optimizer: ExpressionTransformer): AstExpression;
}
