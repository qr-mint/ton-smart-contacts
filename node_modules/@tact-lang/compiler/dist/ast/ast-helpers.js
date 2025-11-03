"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selfId = exports.getAstFactory = void 0;
exports.tryExtractPath = tryExtractPath;
exports.idText = idText;
exports.isInt = isInt;
exports.isBool = isBool;
exports.isCell = isCell;
exports.isSlice = isSlice;
exports.isBuilder = isBuilder;
exports.isAddress = isAddress;
exports.isString = isString;
exports.isStringBuilder = isStringBuilder;
exports.isSelfId = isSelfId;
exports.isWildcard = isWildcard;
exports.isRequire = isRequire;
exports.eqNames = eqNames;
exports.idOfText = idOfText;
exports.astNumToString = astNumToString;
exports.eqExpressions = eqExpressions;
exports.isLiteral = isLiteral;
const errors_1 = require("../error/errors");
const grammar_1 = require("../grammar");
/**
 * Check if input expression is a 'path expression',
 * i.e. an identifier or a sequence of field accesses starting from an identifier.
 * @param path A path expression to check.
 * @returns An array of identifiers or null if the input expression is not a path expression.
 */
function tryExtractPath(path) {
    switch (path.kind) {
        case "id":
            return [path];
        case "field_access": {
            const p = tryExtractPath(path.aggregate);
            return p ? [...p, path.field] : null;
        }
        default:
            return null;
    }
}
const getAstFactory = () => {
    let nextId = 1;
    function createNode(src) {
        return Object.freeze(Object.assign({ id: nextId++ }, src));
    }
    function cloneNode(src) {
        const newNode = { ...src, id: nextId++ };
        return Object.freeze(newNode);
    }
    return {
        createNode,
        cloneNode,
    };
};
exports.getAstFactory = getAstFactory;
function idText(ident) {
    return ident.text;
}
function isInt(ident) {
    return ident.text === "Int";
}
function isBool(ident) {
    return ident.text === "Bool";
}
function isCell(ident) {
    return ident.text === "Cell";
}
function isSlice(ident) {
    return ident.text === "Slice";
}
function isBuilder(ident) {
    return ident.text === "Builder";
}
function isAddress(ident) {
    return ident.text === "Address";
}
function isString(ident) {
    return ident.text === "String";
}
function isStringBuilder(ident) {
    return ident.text === "StringBuilder";
}
function isSelfId(ident) {
    return ident.text === "self";
}
function isWildcard(ident) {
    return ident.text === "_";
}
function isRequire(ident) {
    return ident.text === "require";
}
function eqNames(left, right) {
    if (typeof left === "string") {
        if (typeof right === "string") {
            return left === right;
        }
        return left === right.text;
    }
    else {
        if (typeof right === "string") {
            return left.text === right;
        }
        return left.text === right.text;
    }
}
function idOfText(text) {
    return {
        kind: "id",
        text,
        id: 0,
        loc: grammar_1.dummySrcInfo,
    };
}
function astNumToString(n) {
    switch (n.base) {
        case 2:
            return `0b${n.value.toString(n.base)}`;
        case 8:
            return `0o${n.value.toString(n.base)}`;
        case 10:
            return n.value.toString(n.base);
        case 16:
            return `0x${n.value.toString(n.base)}`;
    }
}
// Test equality of AstExpressions.
// Note this is syntactical equality of expressions.
// For example, two struct instances are equal if they have the same
// type and same fields in the same order.
function eqExpressions(ast1, ast2) {
    if (ast1.kind !== ast2.kind) {
        return false;
    }
    switch (ast1.kind) {
        case "null":
            return true;
        case "boolean":
            return ast1.value === ast2.value;
        case "number":
            return ast1.value === ast2.value;
        case "string":
            return ast1.value === ast2.value;
        case "id":
            return eqNames(ast1, ast2);
        case "address":
            return ast1.value.equals(ast2.value);
        case "cell":
            return ast1.value.equals(ast2.value);
        case "slice":
            return ast1.value
                .asCell()
                .equals(ast2.value.asCell());
        case "simplified_string":
            return ast1.value === ast2.value;
        case "struct_value":
            return (eqNames(ast1.type, ast2.type) &&
                eqArrays(ast1.args, ast2.args, eqFieldValues));
        case "method_call":
            return (eqNames(ast1.method, ast2.method) &&
                eqExpressions(ast1.self, ast2.self) &&
                eqArrays(ast1.args, ast2.args, eqExpressions));
        case "init_of":
            return (eqNames(ast1.contract, ast2.contract) &&
                eqArrays(ast1.args, ast2.args, eqExpressions));
        case "code_of":
            return eqNames(ast1.contract, ast2.contract);
        case "op_unary":
            return (ast1.op === ast2.op &&
                eqExpressions(ast1.operand, ast2.operand));
        case "op_binary":
            return (ast1.op === ast2.op &&
                eqExpressions(ast1.left, ast2.left) &&
                eqExpressions(ast1.right, ast2.right));
        case "conditional":
            return (eqExpressions(ast1.condition, ast2.condition) &&
                eqExpressions(ast1.thenBranch, ast2.thenBranch) &&
                eqExpressions(ast1.elseBranch, ast2.elseBranch));
        case "struct_instance":
            return (eqNames(ast1.type, ast2.type) &&
                eqArrays(ast1.args, ast2.args, eqFieldInitializers));
        case "field_access":
            return (eqNames(ast1.field, ast2.field) &&
                eqExpressions(ast1.aggregate, ast2.aggregate));
        case "static_call":
            return (eqNames(ast1.function, ast2.function) &&
                eqArrays(ast1.args, ast2.args, eqExpressions));
        default:
            (0, errors_1.throwInternalCompilerError)("Unrecognized expression kind");
    }
}
function eqFieldInitializers(arg1, arg2) {
    return (eqNames(arg1.field, arg2.field) &&
        eqExpressions(arg1.initializer, arg2.initializer));
}
function eqFieldValues(arg1, arg2) {
    return (eqNames(arg1.field, arg2.field) &&
        eqExpressions(arg1.initializer, arg2.initializer));
}
function eqArrays(arr1, arr2, eqElements) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (!eqElements(arr1[i], arr2[i])) {
            return false;
        }
    }
    return true;
}
/*
Functions that return guard types like "ast is AstLiteral" are unsafe to use in production code.
But there is a way to make them safe by introducing an intermediate function, like
the "checkLiteral" function defined below after "isLiteral". In principle, it is possible to use "checkLiteral"
directly in the code (which avoids the guard type altogether), but it produces code that reduces readability significantly.

The pattern shown with "isLiteral" and "checkLiteral" can be generalized to other functions that produce a guard type
based on a decision of several cases.
For example, if we have the following function, where we assume that B is a subtype of A:

function isB(d: A): d is B {
  if (cond1(d)) {        // It is assumed that cond1(d) determines d to be of type B inside the if
     return true;
  } else if (cond2(d)) { // It is assumed that cond2(d) determines d to be of type A but not of type B inside the if
     return false;
  } else if (cond3(d)) { // It is assumed that cond3(d) determines d to be of type B inside the if
     return true;
  } else {               // It is assumed that d is of type A but not of type B inside the else
     return false;
  }
}

We can introduce a "checkB" function as follows:

function checkB<T>(d: A, t: (arg: B) => T, f: (arg: Exclude<A,B>) => T): T {
  if (cond1(d)) {
     return t(d);
  } else if (cond2(d)) {
     return f(d);
  } else if (cond3(d)) {
     return t(d);
  } else {
     return f(d);
  }
}

Here, all the "true" cases return t(d) and all the "false" cases return f(d). The names of the functions t and f help remember
that they correspond to the true and false cases, respectively. Observe that cond1(d) and cond3(d) determine the type of
d to be B, which means we can pass d to the t function. For the false cases, the type of d is determined to be
A but not B, which means we can pass d to function f, because f's argument type Exclude<A,B> states
that the argument must be of type A but not of type B, i.e., of type "A - B" if we see the types as sets.

checkB is safe because the compiler will complain if, for example, we use t(d) in the else case:

function checkB<T>(d: A, t: (arg: B) => T, f: (arg: Exclude<A,B>) => T): T {
  if (cond1(d)) {
     return t(d);
  } else if (cond2(d)) {
     return f(d);
  } else if (cond3(d)) {
     return t(d);
  } else {
     return t(d);   // Compiler will signal an error that d is not assignable to type B
  }
}

Contrary to the original function, where the compiler remains silent if we incorrectly return true in the else:

function isB(d: A): d is B {
  if (cond1(d)) {
     return true;
  } else if (cond2(d)) {
     return false;
  } else if (cond3(d)) {
     return true;
  } else {
     return true;   // Wrong, but compiler remains silent
  }
}

After we have our "checkB" function, we can define the "isB" function simply as:

function isB(d: A): d is B {
  return checkB(d, () => true, () => false);
}
*/
function isLiteral(ast) {
    return checkLiteral(ast, () => true, () => false);
}
function checkLiteral(ast, t, f) {
    switch (ast.kind) {
        case "null":
        case "boolean":
        case "number":
        case "address":
        case "cell":
        case "slice":
        case "simplified_string":
        case "struct_value":
            return t(ast);
        case "struct_instance":
        case "string":
        case "id":
        case "method_call":
        case "init_of":
        case "code_of":
        case "op_unary":
        case "op_binary":
        case "conditional":
        case "field_access":
        case "static_call":
            return f(ast);
        default:
            (0, errors_1.throwInternalCompilerError)("Unrecognized expression kind");
    }
}
exports.selfId = {
    kind: "id",
    text: "self",
    id: 0,
    loc: grammar_1.dummySrcInfo,
};
