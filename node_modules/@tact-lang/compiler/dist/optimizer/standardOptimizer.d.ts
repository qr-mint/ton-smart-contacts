import type { AstExpression } from "../ast/ast";
import type { ExpressionTransformer } from "./types";
import type { AstUtil } from "../ast/util";
export declare class StandardOptimizer implements ExpressionTransformer {
    util: AstUtil;
    private rules;
    constructor(util: AstUtil);
    applyRules: (ast: AstExpression) => AstExpression;
}
