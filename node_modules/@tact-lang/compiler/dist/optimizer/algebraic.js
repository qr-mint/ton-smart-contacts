"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NegateFalse = exports.NegateTrue = exports.DoubleNegation = exports.Contradiction = exports.ExcludedMiddle = exports.AndSelf = exports.OrSelf = exports.AndTrue = exports.OrFalse = exports.AndFalse = exports.OrTrue = exports.AddSelf = exports.SubtractSelf = exports.MultiplyOne = exports.MultiplyZero = exports.AddZero = void 0;
const ast_helpers_1 = require("../ast/ast-helpers");
const types_1 = require("./types");
const util_1 = require("../ast/util");
class AddZero extends types_1.Rule {
    additiveOperators = ["+", "-"];
    applyRule(ast, { util }) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (this.additiveOperators.includes(topLevelNode.op)) {
                if (!(0, ast_helpers_1.isLiteral)(topLevelNode.left) &&
                    (0, util_1.checkIsNumber)(topLevelNode.right, 0n)) {
                    // The tree has this form:
                    // x op 0
                    const x = topLevelNode.left;
                    return x;
                }
                else if ((0, util_1.checkIsNumber)(topLevelNode.left, 0n) &&
                    !(0, ast_helpers_1.isLiteral)(topLevelNode.right)) {
                    // The tree has this form:
                    // 0 op x
                    const x = topLevelNode.right;
                    const op = topLevelNode.op;
                    if (op === "-") {
                        return util.makeUnaryExpression("-", x);
                    }
                    else {
                        return x;
                    }
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.AddZero = AddZero;
class MultiplyZero extends types_1.Rule {
    applyRule(ast, { util }) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "*") {
                if ((0, util_1.checkIsName)(topLevelNode.left) &&
                    (0, util_1.checkIsNumber)(topLevelNode.right, 0n)) {
                    // The tree has this form:
                    // x * 0, where x is an identifier
                    return util.makeNumberLiteral(0n, ast.loc);
                }
                else if ((0, util_1.checkIsNumber)(topLevelNode.left, 0n) &&
                    (0, util_1.checkIsName)(topLevelNode.right)) {
                    // The tree has this form:
                    // 0 * x, where x is an identifier
                    return util.makeNumberLiteral(0n, ast.loc);
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.MultiplyZero = MultiplyZero;
class MultiplyOne extends types_1.Rule {
    applyRule(ast, _optimizer) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "*") {
                if (!(0, ast_helpers_1.isLiteral)(topLevelNode.left) &&
                    (0, util_1.checkIsNumber)(topLevelNode.right, 1n)) {
                    // The tree has this form:
                    // x * 1
                    const x = topLevelNode.left;
                    return x;
                }
                else if ((0, util_1.checkIsNumber)(topLevelNode.left, 1n) &&
                    !(0, ast_helpers_1.isLiteral)(topLevelNode.right)) {
                    // The tree has this form:
                    // 1 * x
                    const x = topLevelNode.right;
                    return x;
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.MultiplyOne = MultiplyOne;
class SubtractSelf extends types_1.Rule {
    applyRule(ast, { util }) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "-") {
                if ((0, util_1.checkIsName)(topLevelNode.left) &&
                    (0, util_1.checkIsName)(topLevelNode.right)) {
                    // The tree has this form:
                    // x - y
                    // We need to check that x and y are equal
                    const x = topLevelNode.left;
                    const y = topLevelNode.right;
                    if ((0, ast_helpers_1.eqExpressions)(x, y)) {
                        return util.makeNumberLiteral(0n, ast.loc);
                    }
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.SubtractSelf = SubtractSelf;
class AddSelf extends types_1.Rule {
    applyRule(ast, { applyRules, util }) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "+") {
                if (!(0, ast_helpers_1.isLiteral)(topLevelNode.left) &&
                    !(0, ast_helpers_1.isLiteral)(topLevelNode.right)) {
                    // The tree has this form:
                    // x + y
                    // We need to check that x and y are equal
                    const x = topLevelNode.left;
                    const y = topLevelNode.right;
                    if ((0, ast_helpers_1.eqExpressions)(x, y)) {
                        const res = util.makeBinaryExpression("*", x, util.makeNumberLiteral(2n, ast.loc));
                        // Since we joined the tree, there is further opportunity
                        // for simplification
                        return applyRules(res);
                    }
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.AddSelf = AddSelf;
class OrTrue extends types_1.Rule {
    applyRule(ast, { util }) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "||") {
                if (((0, util_1.checkIsName)(topLevelNode.left) ||
                    (0, ast_helpers_1.isLiteral)(topLevelNode.left)) &&
                    (0, util_1.checkIsBoolean)(topLevelNode.right, true)) {
                    // The tree has this form:
                    // x || true, where x is an identifier or a value
                    return util.makeBooleanLiteral(true, ast.loc);
                }
                else if ((0, util_1.checkIsBoolean)(topLevelNode.left, true)) {
                    // The tree has this form:
                    // true || x
                    return util.makeBooleanLiteral(true, ast.loc);
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.OrTrue = OrTrue;
class AndFalse extends types_1.Rule {
    applyRule(ast, { util }) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "&&") {
                if (((0, util_1.checkIsName)(topLevelNode.left) ||
                    (0, ast_helpers_1.isLiteral)(topLevelNode.left)) &&
                    (0, util_1.checkIsBoolean)(topLevelNode.right, false)) {
                    // The tree has this form:
                    // x && false, where x is an identifier or a value
                    return util.makeBooleanLiteral(false, ast.loc);
                }
                else if ((0, util_1.checkIsBoolean)(topLevelNode.left, false)) {
                    // The tree has this form:
                    // false && x
                    return util.makeBooleanLiteral(false, ast.loc);
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.AndFalse = AndFalse;
class OrFalse extends types_1.Rule {
    applyRule(ast, _optimizer) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "||") {
                if ((0, util_1.checkIsBoolean)(topLevelNode.right, false)) {
                    // The tree has this form:
                    // x || false
                    const x = topLevelNode.left;
                    return x;
                }
                else if ((0, util_1.checkIsBoolean)(topLevelNode.left, false)) {
                    // The tree has this form:
                    // false || x
                    const x = topLevelNode.right;
                    return x;
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.OrFalse = OrFalse;
class AndTrue extends types_1.Rule {
    applyRule(ast, _optimizer) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "&&") {
                if ((0, util_1.checkIsBoolean)(topLevelNode.right, true)) {
                    // The tree has this form:
                    // x && true
                    const x = topLevelNode.left;
                    return x;
                }
                else if ((0, util_1.checkIsBoolean)(topLevelNode.left, true)) {
                    // The tree has this form:
                    // true && x
                    const x = topLevelNode.right;
                    return x;
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.AndTrue = AndTrue;
class OrSelf extends types_1.Rule {
    applyRule(ast, _optimizer) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "||") {
                // The tree has this form:
                // x || y
                // We need to check that x and y are equal
                const x = topLevelNode.left;
                const y = topLevelNode.right;
                if ((0, ast_helpers_1.eqExpressions)(x, y)) {
                    return x;
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.OrSelf = OrSelf;
class AndSelf extends types_1.Rule {
    applyRule(ast, _optimizer) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "&&") {
                // The tree has this form:
                // x && y
                // We need to check that x and y are equal
                const x = topLevelNode.left;
                const y = topLevelNode.right;
                if ((0, ast_helpers_1.eqExpressions)(x, y)) {
                    return x;
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.AndSelf = AndSelf;
class ExcludedMiddle extends types_1.Rule {
    applyRule(ast, { util }) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "||") {
                if ((0, util_1.checkIsUnaryOpNode)(topLevelNode.right)) {
                    const rightNode = topLevelNode.right;
                    if (rightNode.op === "!") {
                        // The tree has this form:
                        // x || !y
                        // We need to check that x is an identifier or a value
                        // and that x and y are equal
                        const x = topLevelNode.left;
                        const y = rightNode.operand;
                        if (((0, util_1.checkIsName)(x) || (0, ast_helpers_1.isLiteral)(x)) &&
                            (0, ast_helpers_1.eqExpressions)(x, y)) {
                            return util.makeBooleanLiteral(true, ast.loc);
                        }
                    }
                }
                else if ((0, util_1.checkIsUnaryOpNode)(topLevelNode.left)) {
                    const leftNode = topLevelNode.left;
                    if (leftNode.op === "!") {
                        // The tree has this form:
                        // !x || y
                        // We need to check that x is an identifier or a value
                        // and that x and y are equal
                        const x = leftNode.operand;
                        const y = topLevelNode.right;
                        if (((0, util_1.checkIsName)(x) || (0, ast_helpers_1.isLiteral)(x)) &&
                            (0, ast_helpers_1.eqExpressions)(x, y)) {
                            return util.makeBooleanLiteral(true, ast.loc);
                        }
                    }
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.ExcludedMiddle = ExcludedMiddle;
class Contradiction extends types_1.Rule {
    applyRule(ast, { util }) {
        if ((0, util_1.checkIsBinaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "&&") {
                if ((0, util_1.checkIsUnaryOpNode)(topLevelNode.right)) {
                    const rightNode = topLevelNode.right;
                    if (rightNode.op === "!") {
                        // The tree has this form:
                        // x && !y
                        // We need to check that x is an identifier or a value
                        // and that x and y are equal
                        const x = topLevelNode.left;
                        const y = rightNode.operand;
                        if (((0, util_1.checkIsName)(x) || (0, ast_helpers_1.isLiteral)(x)) &&
                            (0, ast_helpers_1.eqExpressions)(x, y)) {
                            return util.makeBooleanLiteral(false, ast.loc);
                        }
                    }
                }
                else if ((0, util_1.checkIsUnaryOpNode)(topLevelNode.left)) {
                    const leftNode = topLevelNode.left;
                    if (leftNode.op === "!") {
                        // The tree has this form:
                        // !x && y
                        // We need to check that x is an identifier or a value
                        // and that x and y are equal
                        const x = leftNode.operand;
                        const y = topLevelNode.right;
                        if (((0, util_1.checkIsName)(x) || (0, ast_helpers_1.isLiteral)(x)) &&
                            (0, ast_helpers_1.eqExpressions)(x, y)) {
                            return util.makeBooleanLiteral(false, ast.loc);
                        }
                    }
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.Contradiction = Contradiction;
class DoubleNegation extends types_1.Rule {
    applyRule(ast, _optimizer) {
        if ((0, util_1.checkIsUnaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "!") {
                if ((0, util_1.checkIsUnaryOpNode)(topLevelNode.operand)) {
                    const innerNode = topLevelNode.operand;
                    if (innerNode.op === "!") {
                        // The tree has this form:
                        // !!x
                        const x = innerNode.operand;
                        return x;
                    }
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.DoubleNegation = DoubleNegation;
class NegateTrue extends types_1.Rule {
    applyRule(ast, { util }) {
        if ((0, util_1.checkIsUnaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "!") {
                if ((0, util_1.checkIsBoolean)(topLevelNode.operand, true)) {
                    // The tree has this form
                    // !true
                    return util.makeBooleanLiteral(false, ast.loc);
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.NegateTrue = NegateTrue;
class NegateFalse extends types_1.Rule {
    applyRule(ast, { util }) {
        if ((0, util_1.checkIsUnaryOpNode)(ast)) {
            const topLevelNode = ast;
            if (topLevelNode.op === "!") {
                if ((0, util_1.checkIsBoolean)(topLevelNode.operand, false)) {
                    // The tree has this form
                    // !false
                    return util.makeBooleanLiteral(true, ast.loc);
                }
            }
        }
        // If execution reaches here, it means that the rule could not be applied fully
        // so, we return the original tree
        return ast;
    }
}
exports.NegateFalse = NegateFalse;
