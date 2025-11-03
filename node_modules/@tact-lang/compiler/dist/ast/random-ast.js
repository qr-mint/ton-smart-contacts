#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_check_1 = __importDefault(require("fast-check"));
const random_infra_1 = require("./random.infra");
const ast_printer_1 = require("./ast-printer");
const args = process.argv.slice(2);
if (args.length !== 1) {
    console.error("Usage: yarn random-ast <count>");
    process.exit(1);
}
const count = parseInt(args[0] ?? "", 10);
if (isNaN(count) || count <= 0) {
    console.error("Error: Count must be a positive integer");
    process.exit(1);
}
fast_check_1.default.sample((0, random_infra_1.randomAstExpression)(4), count).forEach((expression, index) => {
    console.log(`Expression ${index + 1}:`);
    console.log((0, ast_printer_1.prettyPrint)(expression));
    console.log("-".repeat(80));
});
