"use strict";
// This module includes rules involving associative rewrites of expressions
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociativeRule3 = exports.AssociativeRule2 = exports.AssociativeRule1 = void 0;
const ast_helpers_1 = require("../ast/ast-helpers");
const iM = __importStar(require("./interpreter"));
const types_1 = require("./types");
const util_1 = require("../ast/util");
const util_2 = require("./util");
class AssociativeRewriteRule extends types_1.Rule {
    // An entry (op, S) in the map means "operator op associates with all operators in set S",
    // mathematically: all op2 \in S. (a op b) op2 c = a op (b op2 c)
    associativeOps;
    // This set contains all operators that commute.
    // Mathematically:
    // all op \in commutativeOps. a op b = b op a
    commutativeOps;
    constructor() {
        super();
        // + associates with these on the right:
        // i.e., all op \in additiveAssoc. (a + b) op c = a + (b op c)
        const additiveAssoc = new Set(["+", "-"]);
        // * associates with these on the right:
        const multiplicativeAssoc = new Set([
            "*",
            "<<",
        ]);
        // Division / does not associate with any on the right
        // Modulus % does not associate with any on the right
        // TODO: shifts, bitwise integer operators, boolean operators
        this.associativeOps = new Map([
            ["+", additiveAssoc],
            ["*", multiplicativeAssoc],
        ]);
        this.commutativeOps = new Set(["+", "*", "!=", "==", "&&", "||"]);
    }
    areAssociative(op1, op2) {
        if (this.associativeOps.has(op1)) {
            const rightOperators = this.associativeOps.get(op1);
            return rightOperators.has(op2);
        }
        else {
            return false;
        }
    }
    isCommutative(op) {
        return this.commutativeOps.has(op);
    }
}
class AllowableOpRule extends AssociativeRewriteRule {
    allowedOps;
    constructor() {
        super();
        this.allowedOps = new Set();
        // Recall that integer operators +,-,*,/,% are not safe with this rule, because
        // there is a risk that they will not preserve overflows in the unknown operands.
        //["&&", "||"], // TODO: check bitwise integer operators
    }
    isAllowedOp(op) {
        return this.allowedOps.has(op);
    }
    areAllowedOps(op) {
        return op.reduce((prev, curr) => prev && this.allowedOps.has(curr), true);
    }
}
// This rule will be removed in a future refactoring, since
// no operator can use it due to the safety conditions.
// At first I thought that boolean expressions could use them
// but I found out they cannot.
class AssociativeRule1 extends AllowableOpRule {
    applyRule(ast, { applyRules, util }) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if ((0, util_1.checkIsBinaryOp_With_RightValue)(topLevelNode.left) &&
                (0, util_1.checkIsBinaryOp_With_RightValue)(topLevelNode.right)) {
                // The tree has this form:
                // (x1 op1 c1) op (x2 op2 c2)
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = leftTree.left;
                const c1 = leftTree.right;
                const op1 = leftTree.op;
                const x2 = rightTree.left;
                const c2 = rightTree.right;
                const op2 = rightTree.op;
                const op = topLevelNode.op;
                // Check that:
                // the operators are allowed
                // op1 and op associate
                // op and op2 associate
                // op commutes
                if (this.areAllowedOps([op1, op, op2]) &&
                    this.areAssociative(op1, op) &&
                    this.areAssociative(op, op2) &&
                    this.isCommutative(op)) {
                    // Agglutinate the constants and compute their final value
                    try {
                        // If an error occurs, we abandon the simplification
                        const val = iM.evalBinaryOp(op2, c1, () => c2, topLevelNode.loc, util);
                        // The final expression is
                        // (x1 op1 x2) op val
                        // Because we are joining x1 and x2,
                        // there is further opportunity of simplification,
                        // So, we ask the evaluator to apply all the rules in the subtree.
                        const newLeft = applyRules(util.makeBinaryExpression(op1, x1, x2));
                        const newRight = val;
                        return util.makeBinaryExpression(op, newLeft, newRight);
                    }
                    catch (_) {
                        // Do nothing: will exit rule without modifying tree
                    }
                }
            }
            else if ((0, util_1.checkIsBinaryOp_With_RightValue)(topLevelNode.left) &&
                (0, util_1.checkIsBinaryOp_With_LeftValue)(topLevelNode.right)) {
                // The tree has this form:
                // (x1 op1 c1) op (c2 op2 x2)
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = leftTree.left;
                const c1 = leftTree.right;
                const op1 = leftTree.op;
                const x2 = rightTree.right;
                const c2 = rightTree.left;
                const op2 = rightTree.op;
                const op = topLevelNode.op;
                // Check that:
                // the operators are allowed
                // op1 and op associate
                // op and op2 associate
                if (this.areAllowedOps([op1, op, op2]) &&
                    this.areAssociative(op1, op) &&
                    this.areAssociative(op, op2)) {
                    // Agglutinate the constants and compute their final value
                    try {
                        // If an error occurs, we abandon the simplification
                        const val = iM.evalBinaryOp(op, c1, () => c2, topLevelNode.loc, util);
                        // The current expression could be either
                        // x1 op1 (val op2 x2) or
                        // (x1 op1 val) op2 x2  <--- we choose this form.
                        // Other rules will attempt to extract the constant outside the expression.
                        // Because we are joining x1 and val,
                        // there is further opportunity of simplification,
                        // So, we ask the evaluator to apply all the rules in the subtree.
                        const newValNode = val;
                        const newLeft = applyRules(util.makeBinaryExpression(op1, x1, newValNode));
                        return util.makeBinaryExpression(op2, newLeft, x2);
                    }
                    catch (_) {
                        // Do nothing: will exit rule without modifying tree
                    }
                }
            }
            else if ((0, util_1.checkIsBinaryOp_With_LeftValue)(topLevelNode.left) &&
                (0, util_1.checkIsBinaryOp_With_RightValue)(topLevelNode.right)) {
                // The tree has this form:
                // (c1 op1 x1) op (x2 op2 c2)
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = leftTree.right;
                const c1 = leftTree.left;
                const op1 = leftTree.op;
                const x2 = rightTree.left;
                const c2 = rightTree.right;
                const op2 = rightTree.op;
                const op = topLevelNode.op;
                // Check that:
                // the operators are allowed
                // op and op1 associate
                // op2 and op associate
                // op commutes
                if (this.areAllowedOps([op1, op, op2]) &&
                    this.areAssociative(op, op1) &&
                    this.areAssociative(op2, op) &&
                    this.isCommutative(op)) {
                    // Agglutinate the constants and compute their final value
                    try {
                        // If an error occurs, we abandon the simplification
                        const val = iM.evalBinaryOp(op, c2, () => c1, topLevelNode.loc, util);
                        // The current expression could be either
                        // x2 op2 (val op1 x1) or
                        // (x2 op2 val) op1 x1  <--- we choose this form.
                        // Other rules will attempt to extract the constant outside the expression.
                        // Because we are joining x2 and val,
                        // there is further opportunity of simplification,
                        // So, we ask the evaluator to apply all the rules in the subtree.
                        const newValNode = val;
                        const newLeft = applyRules(util.makeBinaryExpression(op2, x2, newValNode));
                        return util.makeBinaryExpression(op1, newLeft, x1);
                    }
                    catch (_) {
                        // Do nothing: will exit rule without modifying tree
                    }
                }
            }
            else if ((0, util_1.checkIsBinaryOp_With_LeftValue)(topLevelNode.left) &&
                (0, util_1.checkIsBinaryOp_With_LeftValue)(topLevelNode.right)) {
                // The tree has this form:
                // (c1 op1 x1) op (c2 op2 x2)
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = leftTree.right;
                const c1 = leftTree.left;
                const op1 = leftTree.op;
                const x2 = rightTree.right;
                const c2 = rightTree.left;
                const op2 = rightTree.op;
                const op = topLevelNode.op;
                // Check that:
                // the operators are allowed
                // op1 and op associate
                // op and op2 associate
                // op commutes
                if (this.areAllowedOps([op1, op, op2]) &&
                    this.areAssociative(op1, op) &&
                    this.areAssociative(op, op2) &&
                    this.isCommutative(op)) {
                    // Agglutinate the constants and compute their final value
                    try {
                        // If an error occurs, we abandon the simplification
                        const val = iM.evalBinaryOp(op1, c1, () => c2, topLevelNode.loc, util);
                        // The final expression is
                        // val op (x1 op2 x2)
                        // Because we are joining x1 and x2,
                        // there is further opportunity of simplification,
                        // So, we ask the evaluator to apply all the rules in the subtree.
                        const newRight = applyRules(util.makeBinaryExpression(op2, x1, x2));
                        const newLeft = val;
                        return util.makeBinaryExpression(op, newLeft, newRight);
                    }
                    catch (_) {
                        // Do nothing: will exit rule without modifying tree
                    }
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.AssociativeRule1 = AssociativeRule1;
// This rule will be removed in a future refactoring, since
// no operator can use it due to the safety conditions.
// At first I thought that boolean expressions could use them
// but I found out they cannot.
class AssociativeRule2 extends AllowableOpRule {
    applyRule(ast, { applyRules, util }) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if ((0, util_1.checkIsBinaryOp_With_RightValue)(topLevelNode.left) &&
                !(0, ast_helpers_1.isLiteral)(topLevelNode.right)) {
                // The tree has this form:
                // (x1 op1 c1) op x2
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = leftTree.left;
                const c1 = leftTree.right;
                const op1 = leftTree.op;
                const x2 = rightTree;
                const op = topLevelNode.op;
                // Check that:
                // the operators are allowed
                // op1 and op associate
                // op commutes
                if (this.areAllowedOps([op1, op]) &&
                    this.areAssociative(op1, op) &&
                    this.isCommutative(op)) {
                    // The final expression is
                    // (x1 op1 x2) op c1
                    // Because we are joining x1 and x2,
                    // there is further opportunity of simplification,
                    // So, we ask the evaluator to apply all the rules in the subtree.
                    const newLeft = applyRules(util.makeBinaryExpression(op1, x1, x2));
                    return util.makeBinaryExpression(op, newLeft, c1);
                }
            }
            else if ((0, util_1.checkIsBinaryOp_With_LeftValue)(topLevelNode.left) &&
                !(0, ast_helpers_1.isLiteral)(topLevelNode.right)) {
                // The tree has this form:
                // (c1 op1 x1) op x2
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = leftTree.right;
                const c1 = leftTree.left;
                const op1 = leftTree.op;
                const x2 = rightTree;
                const op = topLevelNode.op;
                // Check that:
                // the operators are allowed
                // op1 and op associate
                if (this.areAllowedOps([op1, op]) &&
                    this.areAssociative(op1, op)) {
                    // The final expression is
                    // c1 op1 (x1 op x2)
                    // Because we are joining x1 and x2,
                    // there is further opportunity of simplification,
                    // So, we ask the evaluator to apply all the rules in the subtree.
                    const newRight = applyRules(util.makeBinaryExpression(op, x1, x2));
                    return util.makeBinaryExpression(op1, c1, newRight);
                }
            }
            else if (!(0, ast_helpers_1.isLiteral)(topLevelNode.left) &&
                (0, util_1.checkIsBinaryOp_With_RightValue)(topLevelNode.right)) {
                // The tree has this form:
                // x2 op (x1 op1 c1)
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = rightTree.left;
                const c1 = rightTree.right;
                const op1 = rightTree.op;
                const x2 = leftTree;
                const op = topLevelNode.op;
                // Check that:
                // the operators are allowed
                // op and op1 associate
                if (this.areAllowedOps([op, op1]) &&
                    this.areAssociative(op, op1)) {
                    // The final expression is
                    // (x2 op x1) op1 c1
                    // Because we are joining x1 and x2,
                    // there is further opportunity of simplification,
                    // So, we ask the evaluator to apply all the rules in the subtree.
                    const newLeft = applyRules(util.makeBinaryExpression(op, x2, x1));
                    return util.makeBinaryExpression(op1, newLeft, c1);
                }
            }
            else if (!(0, ast_helpers_1.isLiteral)(topLevelNode.left) &&
                (0, util_1.checkIsBinaryOp_With_LeftValue)(topLevelNode.right)) {
                // The tree has this form:
                // x2 op (c1 op1 x1)
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = rightTree.right;
                const c1 = rightTree.left;
                const op1 = rightTree.op;
                const x2 = leftTree;
                const op = topLevelNode.op;
                // Check that:
                // the operators are allowed
                // op and op1 associate
                // op is commutative
                if (this.areAllowedOps([op, op1]) &&
                    this.areAssociative(op, op1) &&
                    this.isCommutative(op)) {
                    // The final expression is
                    // c1 op (x2 op1 x1)
                    // Because we are joining x1 and x2,
                    // there is further opportunity of simplification,
                    // So, we ask the evaluator to apply all the rules in the subtree.
                    const newRight = applyRules(util.makeBinaryExpression(op1, x2, x1));
                    return util.makeBinaryExpression(op, c1, newRight);
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.AssociativeRule2 = AssociativeRule2;
class AssociativeRule3 extends types_1.Rule {
    leftAssocTransforms;
    rightAssocTransforms;
    rightCommuteTransforms;
    leftCommuteTransforms;
    // Safety conditions that repeat a lot.
    // Safety condition:
    // c1 < center ==> val_ - c1 <= 0
    // c1 > center ==> val_ - c1 >= 0
    standardAdditiveCondition(c1, val_, center) {
        if (c1 === center) {
            return true;
        }
        else if (c1 < center) {
            return val_ - c1 <= 0n;
        }
        else {
            return val_ - c1 >= 0n;
        }
    }
    // Safety condition:
    // c1 < 0 ==> val_ - c1 <= -1
    // c1 > 0 ==> val_ - c1 >= -1
    shiftedAdditiveCondition(c1, val_) {
        if (c1 === 0n) {
            return true;
        }
        else if (c1 < 0n) {
            return val_ - c1 <= -1n;
        }
        else {
            return val_ - c1 >= -1n;
        }
    }
    // Safety condition:
    // c1 < center ==> val_ + c1 >= -1
    // c1 > center ==> val_ + c1 <= -1
    oppositeAdditiveCondition(c1, val_, center) {
        if (c1 === center) {
            return true;
        }
        else if (c1 < center) {
            return val_ + c1 >= -1n;
        }
        else {
            return val_ + c1 <= -1n;
        }
    }
    // Safety condition:
    // c1 != 0 && sign(c1) == sign(val_) ==> abs(c1) <= abs(val_)
    // c1 != 0 && sign(c1) != sign(val_) ==> abs(c1) < abs(val_)
    // c1 != 0 ==> val_ != 0
    standardMultiplicativeCondition(c1, val_) {
        if (c1 === 0n) {
            return true;
        }
        // At this point, c1 != 0
        // hence, val_ must be non-zero as
        // required by the safety condition
        if (val_ === 0n) {
            return false;
        }
        // At this point, both c1 and val_ are non-zero
        if ((0, util_2.sign)(c1) === (0, util_2.sign)(val_)) {
            return (0, util_2.abs)(c1) <= (0, util_2.abs)(val_);
        }
        else {
            return (0, util_2.abs)(c1) < (0, util_2.abs)(val_);
        }
    }
    constructor() {
        super();
        // First, we consider expressions of the form: (x1 op1 c1) op c2.
        // The following maps correspond to the transformation: x1 op1_ (c1_ op_ c2_)
        // for each pair of operators op1, op.
        // Here, we will denote c1_ op_ c2_ as val_.
        // op1 = +
        const plusLeftAssocOperators = new Map([
            [
                "+",
                // original expression: (x1 + c1) + c2
                (x1, c1, c2, util, s) => {
                    // final expression: x1 + (c1 + c2)
                    const val_ = iM.ensureInt(iM.evalBinaryOp("+", c1, () => c2, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("+", x1, val_),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, 0n),
                    };
                },
            ],
            [
                "-",
                // original expression: (x1 + c1) - c2
                (x1, c1, c2, util, s) => {
                    // final expression: x1 + (c1 - c2)
                    const val_ = iM.ensureInt(iM.evalBinaryOp("-", c1, () => c2, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("+", x1, val_),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, 0n),
                    };
                },
            ],
        ]);
        // op1 = -
        const minusLeftAssocOperators = new Map([
            [
                "+",
                // original expression: (x1 - c1) + c2
                (x1, c1, c2, util, s) => {
                    // final expression x1 - (c1 - c2)
                    const val_ = iM.ensureInt(iM.evalBinaryOp("-", c1, () => c2, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("-", x1, val_),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, 0n),
                    };
                },
            ],
            [
                "-",
                // original expression: (x1 - c1) - c2
                (x1, c1, c2, util, s) => {
                    // final expression x1 - (c1 + c2)
                    const val_ = iM.ensureInt(iM.evalBinaryOp("+", c1, () => c2, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("-", x1, val_),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, 0n),
                    };
                },
            ],
        ]);
        // op1 = *
        const multiplyLeftAssocOperators = new Map([
            [
                "*",
                // original expression: (x1 * c1) * c2
                (x1, c1, c2, util, s) => {
                    // final expression x1 * (c1 * c2)
                    const val_ = iM.ensureInt(iM.evalBinaryOp("*", c1, () => c2, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("*", x1, val_),
                        safetyCondition: this.standardMultiplicativeCondition(c1_.value, val_.value),
                    };
                },
            ],
        ]);
        // op1 = &&
        const andLeftAssocOperators = new Map([
            [
                "&&",
                // original expression: (x1 && c1) && c2
                (x1, c1, c2, util, s) => {
                    // final expression x1 && (c1 && c2)
                    const val_ = iM.evalBinaryOp("&&", c1, () => c2, s, util);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("&&", x1, val_),
                        safetyCondition: true,
                    };
                },
            ],
        ]);
        // op1 = ||
        const orLeftAssocOperators = new Map([
            [
                "||",
                // original expression: (x1 || c1) || c2
                (x1, c1, c2, util, s) => {
                    // final expression x1 || (c1 || c2)
                    const val_ = iM.evalBinaryOp("||", c1, () => c2, s, util);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("||", x1, val_),
                        safetyCondition: true,
                    };
                },
            ],
        ]);
        this.leftAssocTransforms = new Map([
            ["+", plusLeftAssocOperators],
            ["-", minusLeftAssocOperators],
            ["*", multiplyLeftAssocOperators],
            ["&&", andLeftAssocOperators],
            ["||", orLeftAssocOperators],
        ]);
        // Now consider expressions of the form: c2 op (c1 op1 x1).
        // The following maps correspond to the transformation: (c2_ op_ c1_) op1_ x1
        // for each pair of operators op1, op.
        // Here, we will denote c2_ op_ c1_ as val_.
        // op = +
        const plusRightAssocOperators = new Map([
            [
                "+",
                // original expression: c2 + (c1 + x1)
                (x1, c1, c2, util, s) => {
                    // final expression (c2 + c1) + x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("+", c2, () => c1, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("+", val_, x1),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, 0n),
                    };
                },
            ],
            [
                "-",
                // original expression: c2 + (c1 - x1)
                (x1, c1, c2, util, s) => {
                    // final expression (c2 + c1) - x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("+", c2, () => c1, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("-", val_, x1),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, -1n),
                    };
                },
            ],
        ]);
        // op = -
        const minusRightAssocOperators = new Map([
            [
                "+",
                // original expression: c2 - (c1 + x1)
                (x1, c1, c2, util, s) => {
                    // final expression (c2 - c1) - x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("-", c2, () => c1, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("-", val_, x1),
                        safetyCondition: this.oppositeAdditiveCondition(c1_.value, val_.value, 0n),
                    };
                },
            ],
            [
                "-",
                // original expression: c2 - (c1 - x1)
                (x1, c1, c2, util, s) => {
                    // final expression (c2 - c1) + x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("-", c2, () => c1, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("+", val_, x1),
                        safetyCondition: this.oppositeAdditiveCondition(c1_.value, val_.value, -1n),
                    };
                },
            ],
        ]);
        // op = *
        const multiplyRightAssocOperators = new Map([
            [
                "*",
                // original expression: c2 * (c1 * x1)
                (x1, c1, c2, util, s) => {
                    // final expression (c2 * c1) * x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("*", c2, () => c1, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("*", val_, x1),
                        safetyCondition: this.standardMultiplicativeCondition(c1_.value, val_.value),
                    };
                },
            ],
        ]);
        // op = &&
        const andRightAssocOperators = new Map([
            [
                "&&",
                // original expression: c2 && (c1 && x1)
                (x1, c1, c2, util, s) => {
                    // final expression (c2 && c1) && x1
                    const val_ = iM.evalBinaryOp("&&", c2, () => c1, s, util);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("&&", val_, x1),
                        safetyCondition: true,
                    };
                },
            ],
        ]);
        // op = ||
        const orRightAssocOperators = new Map([
            [
                "||",
                // original expression: c2 || (c1 || x1)
                (x1, c1, c2, util, s) => {
                    // final expression (c2 || c1) || x1
                    const val_ = iM.evalBinaryOp("||", c2, () => c1, s, util);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("||", val_, x1),
                        safetyCondition: true,
                    };
                },
            ],
        ]);
        this.rightAssocTransforms = new Map([
            ["+", plusRightAssocOperators],
            ["-", minusRightAssocOperators],
            ["*", multiplyRightAssocOperators],
            ["&&", andRightAssocOperators],
            ["||", orRightAssocOperators],
        ]);
        // Now consider expressions of the form: c2 op (x1 op1 c1).
        // The following maps correspond to the transformation: x1 op1_ (c2_ op_ c1_)_
        // for each pair of operators op1, op.
        // Here, we will denote c2_ op_ c1_ as val_.
        // op = +
        const plusRightCommuteOperators = new Map([
            [
                "+",
                // original expression: c2 + (x1 + c1)
                (x1, c1, c2, util, s) => {
                    // final expression x1 + (c2 + c1)
                    const val_ = iM.ensureInt(iM.evalBinaryOp("+", c2, () => c1, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("+", x1, val_),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, 0n),
                    };
                },
            ],
            [
                "-",
                // original expression: c2 + (x1 - c1)
                (x1, c1, c2, util, s) => {
                    // final expression x1 - (c1 - c2)
                    const val_ = iM.ensureInt(iM.evalBinaryOp("-", c1, () => c2, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("-", x1, val_),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, 0n),
                    };
                },
            ],
        ]);
        // op = -
        const minusRightCommuteOperators = new Map([
            [
                "+",
                // original expression: c2 - (x1 + c1)
                (x1, c1, c2, util, s) => {
                    // final expression (c2 - c1) - x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("-", c2, () => c1, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("-", val_, x1),
                        safetyCondition: this.oppositeAdditiveCondition(c1_.value, val_.value, 0n),
                    };
                },
            ],
            [
                "-",
                // original expression: c2 - (x1 - c1)
                (x1, c1, c2, util, s) => {
                    // final expression (c2 + c1) - x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("+", c2, () => c1, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("-", val_, x1),
                        safetyCondition: this.shiftedAdditiveCondition(c1_.value, val_.value),
                    };
                },
            ],
        ]);
        // op = *
        const multiplyRightCommuteOperators = new Map([
            [
                "*",
                // original expression: c2 * (x1 * c1)
                (x1, c1, c2, util, s) => {
                    // Final expression x1 * (c2 * c1)
                    const val_ = iM.ensureInt(iM.evalBinaryOp("*", c2, () => c1, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("*", x1, val_),
                        safetyCondition: this.standardMultiplicativeCondition(c1_.value, val_.value),
                    };
                },
            ],
        ]);
        // op = &&
        const andRightCommuteOperators = new Map([
            [
                "&&",
                // original expression: c2 && (x1 && c1)
                (x1, c1, c2, util, s) => {
                    const val_ = iM.evalBinaryOp("&&", c2, () => c1, s, util);
                    const c1_ = iM.ensureBoolean(c1);
                    const c2_ = iM.ensureBoolean(c2);
                    let final_expr;
                    if (c2_.value) {
                        // Final expression x1 && (c2 && c1)
                        final_expr = util.makeBinaryExpression("&&", x1, val_);
                    }
                    else {
                        // Final expression (c2 && c1) && x1
                        // Note that by the safety condition,
                        // at this point c1 = true.
                        final_expr = util.makeBinaryExpression("&&", val_, x1);
                    }
                    return {
                        simplifiedExpression: final_expr,
                        safetyCondition: c1_.value || c2_.value,
                    };
                },
            ],
        ]);
        // op = ||
        const orRightCommuteOperators = new Map([
            [
                "||",
                // original expression: c2 || (x1 || c1)
                (x1, c1, c2, util, s) => {
                    const val_ = iM.evalBinaryOp("||", c2, () => c1, s, util);
                    const c1_ = iM.ensureBoolean(c1);
                    const c2_ = iM.ensureBoolean(c2);
                    let final_expr;
                    if (!c2_.value) {
                        // Final expression x1 || (c2 || c1)
                        final_expr = util.makeBinaryExpression("||", x1, val_);
                    }
                    else {
                        // Final expression (c2 || c1) || x1
                        // Note that by the safety condition,
                        // at this point c1 = false.
                        final_expr = util.makeBinaryExpression("||", val_, x1);
                    }
                    return {
                        simplifiedExpression: final_expr,
                        safetyCondition: !c1_.value || !c2_.value,
                    };
                },
            ],
        ]);
        this.rightCommuteTransforms = new Map([
            ["+", plusRightCommuteOperators],
            ["-", minusRightCommuteOperators],
            ["*", multiplyRightCommuteOperators],
            ["&&", andRightCommuteOperators],
            ["||", orRightCommuteOperators],
        ]);
        // Now consider expressions of the form: (c1 op1 x1) op c2.
        // The following maps correspond to the transformation: x1 op1_ (c1_ op_ c2_)
        // for each pair of operators op1, op.
        // op1 = +
        const plusLeftCommuteOperators = new Map([
            [
                "+",
                // original expression: (c1 + x1) + c2
                (x1, c1, c2, util, s) => {
                    // Final expression (c1 + c2) + x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("+", c1, () => c2, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("+", val_, x1),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, 0n),
                    };
                },
            ],
            [
                "-",
                // original expression: (c1 + x1) - c2
                (x1, c1, c2, util, s) => {
                    // Final expression (c1 - c2) + x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("-", c1, () => c2, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("+", val_, x1),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, 0n),
                    };
                },
            ],
        ]);
        // op1 = -
        const minusLeftCommuteOperators = new Map([
            [
                "+",
                // original expression: (c1 - x1) + c2
                (x1, c1, c2, util, s) => {
                    // Final expression (c1 + c2) - x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("+", c1, () => c2, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("-", val_, x1),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, -1n),
                    };
                },
            ],
            [
                "-",
                // original expression: (c1 - x1) - c2
                (x1, c1, c2, util, s) => {
                    // Final expression (c1 - c2) - x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("-", c1, () => c2, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("-", val_, x1),
                        safetyCondition: this.standardAdditiveCondition(c1_.value, val_.value, -1n),
                    };
                },
            ],
        ]);
        // op1 = *
        const multiplyLeftCommuteOperators = new Map([
            [
                "*",
                // original expression: (c1 * x1) * c2
                (x1, c1, c2, util, s) => {
                    // Final expression (c1 * c2) * x1
                    const val_ = iM.ensureInt(iM.evalBinaryOp("*", c1, () => c2, s, util));
                    const c1_ = iM.ensureInt(c1);
                    return {
                        simplifiedExpression: util.makeBinaryExpression("*", val_, x1),
                        safetyCondition: this.standardMultiplicativeCondition(c1_.value, val_.value),
                    };
                },
            ],
        ]);
        // op1 = &&
        const andLeftCommuteOperators = new Map([
            [
                "&&",
                // original expression: (c1 && x1) && c2
                (x1, c1, c2, util, s) => {
                    const val_ = iM.evalBinaryOp("&&", c1, () => c2, s, util);
                    const c1_ = iM.ensureBoolean(c1);
                    const c2_ = iM.ensureBoolean(c2);
                    let final_expr;
                    if (c2_.value) {
                        // Final expression (c1 && c2) && x1
                        final_expr = util.makeBinaryExpression("&&", val_, x1);
                    }
                    else {
                        // Final expression x1 && (c1 && c2)
                        // Note that by the safety condition,
                        // at this point c1 = true.
                        final_expr = util.makeBinaryExpression("&&", x1, val_);
                    }
                    return {
                        simplifiedExpression: final_expr,
                        safetyCondition: c1_.value || c2_.value,
                    };
                },
            ],
        ]);
        // op1 = ||
        const orLeftCommuteOperators = new Map([
            [
                "||",
                // original expression: (c1 || x1) || c2
                (x1, c1, c2, util, s) => {
                    const val_ = iM.evalBinaryOp("||", c1, () => c2, s, util);
                    const c1_ = iM.ensureBoolean(c1);
                    const c2_ = iM.ensureBoolean(c2);
                    let final_expr;
                    if (!c2_.value) {
                        // Final expression (c1 || c2) || x1
                        final_expr = util.makeBinaryExpression("||", val_, x1);
                    }
                    else {
                        // Final expression x1 || (c1 || c2)
                        // Note that by the safety condition,
                        // at this point c1 = false.
                        final_expr = util.makeBinaryExpression("||", x1, val_);
                    }
                    return {
                        simplifiedExpression: final_expr,
                        safetyCondition: !c1_.value || !c2_.value,
                    };
                },
            ],
        ]);
        this.leftCommuteTransforms = new Map([
            ["+", plusLeftCommuteOperators],
            ["-", minusLeftCommuteOperators],
            ["*", multiplyLeftCommuteOperators],
            ["&&", andLeftCommuteOperators],
            ["||", orLeftCommuteOperators],
        ]);
    }
    lookupTransform(keyOp1, keyOp2, transforms) {
        if (transforms.has(keyOp1)) {
            const intermediateMap = transforms.get(keyOp1);
            if (intermediateMap.has(keyOp2)) {
                return intermediateMap.get(keyOp2);
            }
        }
        return undefined;
    }
    getLeftAssociativityTransform(keyOp1, keyOp2) {
        return this.lookupTransform(keyOp1, keyOp2, this.leftAssocTransforms);
    }
    getRightAssociativityTransform(keyOp1, keyOp2) {
        return this.lookupTransform(keyOp1, keyOp2, this.rightAssocTransforms);
    }
    getLeftCommutativityTransform(keyOp1, keyOp2) {
        return this.lookupTransform(keyOp1, keyOp2, this.leftCommuteTransforms);
    }
    getRightCommutativityTransform(keyOp1, keyOp2) {
        return this.lookupTransform(keyOp1, keyOp2, this.rightCommuteTransforms);
    }
    applyRule(ast, { applyRules, util }) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if ((0, util_1.checkIsBinaryOp_With_RightValue)(topLevelNode.left) &&
                (0, ast_helpers_1.isLiteral)(topLevelNode.right)) {
                // The tree has this form:
                // (x1 op1 c1) op c2
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = leftTree.left;
                const c1 = leftTree.right;
                const op1 = leftTree.op;
                const c2 = rightTree;
                const op = topLevelNode.op;
                try {
                    const data = this.getLeftAssociativityTransform(op1, op)(x1, c1, c2, util, topLevelNode.loc);
                    if (data.safetyCondition) {
                        // Since the tree is simpler now, there is further
                        // opportunity for simplification that was missed
                        // previously
                        return applyRules(data.simplifiedExpression);
                    }
                }
                catch (_) {
                    // Do nothing: will exit rule without modifying tree
                }
            }
            else if ((0, util_1.checkIsBinaryOp_With_LeftValue)(topLevelNode.left) &&
                (0, ast_helpers_1.isLiteral)(topLevelNode.right)) {
                // The tree has this form:
                // (c1 op1 x1) op c2
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = leftTree.right;
                const c1 = leftTree.left;
                const op1 = leftTree.op;
                const c2 = rightTree;
                const op = topLevelNode.op;
                try {
                    const data = this.getLeftCommutativityTransform(op1, op)(x1, c1, c2, util, topLevelNode.loc);
                    if (data.safetyCondition) {
                        // Since the tree is simpler now, there is further
                        // opportunity for simplification that was missed
                        // previously
                        return applyRules(data.simplifiedExpression);
                    }
                }
                catch (_) {
                    // Do nothing: will exit rule without modifying tree
                }
            }
            else if ((0, ast_helpers_1.isLiteral)(topLevelNode.left) &&
                (0, util_1.checkIsBinaryOp_With_RightValue)(topLevelNode.right)) {
                // The tree has this form:
                // c2 op (x1 op1 c1)
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = rightTree.left;
                const c1 = rightTree.right;
                const op1 = rightTree.op;
                const c2 = leftTree;
                const op = topLevelNode.op;
                try {
                    const data = this.getRightCommutativityTransform(op, op1)(x1, c1, c2, util, topLevelNode.loc);
                    if (data.safetyCondition) {
                        // Since the tree is simpler now, there is further
                        // opportunity for simplification that was missed
                        // previously
                        return applyRules(data.simplifiedExpression);
                    }
                }
                catch (_) {
                    // Do nothing: will exit rule without modifying tree
                }
            }
            else if ((0, ast_helpers_1.isLiteral)(topLevelNode.left) &&
                (0, util_1.checkIsBinaryOp_With_LeftValue)(topLevelNode.right)) {
                // The tree has this form:
                // c2 op (c1 op1 x1)
                const leftTree = topLevelNode.left;
                const rightTree = topLevelNode.right;
                const x1 = rightTree.right;
                const c1 = rightTree.left;
                const op1 = rightTree.op;
                const c2 = leftTree;
                const op = topLevelNode.op;
                try {
                    const data = this.getRightAssociativityTransform(op, op1)(x1, c1, c2, util, topLevelNode.loc);
                    if (data.safetyCondition) {
                        // Since the tree is simpler now, there is further
                        // opportunity for simplification that was missed
                        // previously
                        return applyRules(data.simplifiedExpression);
                    }
                }
                catch (_) {
                    // Do nothing: will exit rule without modifying tree
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.AssociativeRule3 = AssociativeRule3;
