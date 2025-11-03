"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.astFunctionAttributeNames = exports.astConstantAttributeNames = exports.importTypes = exports.astNumberBases = exports.astUnaryOperations = exports.astBinaryOperations = exports.astAugmentedAssignOperations = void 0;
const tricks_1 = require("../utils/tricks");
const augmentedAssignOperationsRecord = {
    "+": true,
    "-": true,
    "*": true,
    "/": true,
    "&&": true,
    "||": true,
    "%": true,
    "|": true,
    "<<": true,
    ">>": true,
    "&": true,
    "^": true,
};
exports.astAugmentedAssignOperations = Object.freeze((0, tricks_1.keys)(augmentedAssignOperationsRecord));
const binaryOperationsRecord = {
    "+": true,
    "-": true,
    "*": true,
    "/": true,
    "!=": true,
    ">": true,
    "<": true,
    ">=": true,
    "<=": true,
    "==": true,
    "&&": true,
    "||": true,
    "%": true,
    "<<": true,
    ">>": true,
    "&": true,
    "|": true,
    "^": true,
};
exports.astBinaryOperations = Object.freeze((0, tricks_1.keys)(binaryOperationsRecord));
const unaryOperationsRecord = {
    "+": true,
    "-": true,
    "!": true,
    "!!": true,
    "~": true,
};
exports.astUnaryOperations = Object.freeze((0, tricks_1.keys)(unaryOperationsRecord));
const numberBasesRecord = {
    2: true,
    8: true,
    10: true,
    16: true,
};
exports.astNumberBases = Object.freeze((0, tricks_1.keys)(numberBasesRecord).map(Number));
const importTypesRecord = {
    stdlib: true,
    relative: true,
};
exports.importTypes = Object.freeze((0, tricks_1.keys)(importTypesRecord));
const constantAttributeNamesRecord = {
    virtual: true,
    override: true,
    abstract: true,
};
exports.astConstantAttributeNames = Object.freeze((0, tricks_1.keys)(constantAttributeNamesRecord));
const functionAttributeNamesRecord = {
    mutates: true,
    extends: true,
    virtual: true,
    abstract: true,
    override: true,
    inline: true,
};
exports.astFunctionAttributeNames = Object.freeze((0, tricks_1.keys)(functionAttributeNamesRecord));
