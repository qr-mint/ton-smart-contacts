"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardOptimizer = void 0;
const algebraic_1 = require("./algebraic");
const associative_1 = require("./associative");
// This optimizer uses rules that preserve overflows in integer expressions.
class StandardOptimizer {
    util;
    rules;
    constructor(util) {
        this.util = util;
        this.rules = [
            { priority: 0, rule: new associative_1.AssociativeRule1() },
            { priority: 1, rule: new associative_1.AssociativeRule2() },
            { priority: 2, rule: new associative_1.AssociativeRule3() },
            { priority: 3, rule: new algebraic_1.AddZero() },
            { priority: 4, rule: new algebraic_1.MultiplyZero() },
            { priority: 5, rule: new algebraic_1.MultiplyOne() },
            { priority: 6, rule: new algebraic_1.SubtractSelf() },
            { priority: 7, rule: new algebraic_1.AddSelf() },
            { priority: 8, rule: new algebraic_1.OrTrue() },
            { priority: 9, rule: new algebraic_1.AndFalse() },
            { priority: 10, rule: new algebraic_1.OrFalse() },
            { priority: 11, rule: new algebraic_1.AndTrue() },
            { priority: 12, rule: new algebraic_1.OrSelf() },
            { priority: 13, rule: new algebraic_1.AndSelf() },
            { priority: 14, rule: new algebraic_1.ExcludedMiddle() },
            { priority: 15, rule: new algebraic_1.Contradiction() },
            { priority: 16, rule: new algebraic_1.DoubleNegation() },
            { priority: 17, rule: new algebraic_1.NegateTrue() },
            { priority: 18, rule: new algebraic_1.NegateFalse() },
        ];
        // Sort according to the priorities: smaller number means greater priority.
        // So, the rules will be sorted increasingly according to their priority number.
        this.rules.sort((r1, r2) => r1.priority - r2.priority);
    }
    applyRules = (ast) => {
        return this.rules.reduce((prev, prioritizedRule) => prioritizedRule.rule.applyRule(prev, this), ast);
    };
}
exports.StandardOptimizer = StandardOptimizer;
