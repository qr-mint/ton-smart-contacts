"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAstUtil = void 0;
exports.checkIsUnaryOpNode = checkIsUnaryOpNode;
exports.checkIsBinaryOpNode = checkIsBinaryOpNode;
exports.checkIsBinaryOp_With_RightValue = checkIsBinaryOp_With_RightValue;
exports.checkIsBinaryOp_With_LeftValue = checkIsBinaryOp_With_LeftValue;
exports.checkIsNumber = checkIsNumber;
exports.checkIsName = checkIsName;
exports.checkIsBoolean = checkIsBoolean;
const ast_helpers_1 = require("./ast-helpers");
const grammar_1 = require("../grammar");
const getAstUtil = ({ createNode }) => {
    function makeUnaryExpression(op, operand) {
        const result = createNode({
            kind: "op_unary",
            op: op,
            operand: operand,
            loc: grammar_1.dummySrcInfo,
        });
        return result;
    }
    function makeBinaryExpression(op, left, right) {
        const result = createNode({
            kind: "op_binary",
            op: op,
            left: left,
            right: right,
            loc: grammar_1.dummySrcInfo,
        });
        return result;
    }
    function makeNumberLiteral(n, loc) {
        const result = createNode({
            kind: "number",
            base: 10,
            value: n,
            loc: loc,
        });
        return result;
    }
    function makeBooleanLiteral(b, loc) {
        const result = createNode({
            kind: "boolean",
            value: b,
            loc: loc,
        });
        return result;
    }
    function makeSimplifiedStringLiteral(s, loc) {
        const result = createNode({
            kind: "simplified_string",
            value: s,
            loc: loc,
        });
        return result;
    }
    function makeNullLiteral(loc) {
        const result = createNode({
            kind: "null",
            loc: loc,
        });
        return result;
    }
    function makeCellLiteral(c, loc) {
        const result = createNode({
            kind: "cell",
            value: c,
            loc: loc,
        });
        return result;
    }
    function makeSliceLiteral(s, loc) {
        const result = createNode({
            kind: "slice",
            value: s,
            loc: loc,
        });
        return result;
    }
    function makeAddressLiteral(a, loc) {
        const result = createNode({
            kind: "address",
            value: a,
            loc: loc,
        });
        return result;
    }
    function makeStructFieldValue(fieldName, val, loc) {
        const result = createNode({
            kind: "struct_field_value",
            field: createNode({
                kind: "id",
                text: fieldName,
                loc: loc,
            }),
            initializer: val,
            loc: loc,
        });
        return result;
    }
    function makeStructValue(fields, type, loc) {
        const result = createNode({
            kind: "struct_value",
            args: fields,
            loc: loc,
            type: type,
        });
        return result;
    }
    return {
        makeUnaryExpression,
        makeBinaryExpression,
        makeNumberLiteral,
        makeBooleanLiteral,
        makeSimplifiedStringLiteral,
        makeNullLiteral,
        makeCellLiteral,
        makeSliceLiteral,
        makeAddressLiteral,
        makeStructFieldValue,
        makeStructValue,
    };
};
exports.getAstUtil = getAstUtil;
// Checks if the top level node is an unary op node
function checkIsUnaryOpNode(ast) {
    return ast.kind === "op_unary";
}
// Checks if the top level node is a binary op node
function checkIsBinaryOpNode(ast) {
    return ast.kind === "op_binary";
}
// Checks if top level node is a binary op node
// with a value node on the right
function checkIsBinaryOp_With_RightValue(ast) {
    return ast.kind === "op_binary" ? (0, ast_helpers_1.isLiteral)(ast.right) : false;
}
// Checks if top level node is a binary op node
// with a value node on the left
function checkIsBinaryOp_With_LeftValue(ast) {
    return ast.kind === "op_binary" ? (0, ast_helpers_1.isLiteral)(ast.left) : false;
}
// Checks if the top level node is the specified number
function checkIsNumber(ast, n) {
    return ast.kind === "number" ? ast.value == n : false;
}
function checkIsName(ast) {
    return ast.kind === "id";
}
// Checks if the top level node is the specified boolean
function checkIsBoolean(ast, b) {
    return ast.kind === "boolean" ? ast.value == b : false;
}
