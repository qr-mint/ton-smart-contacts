"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = compile;
const createABI_1 = require("../generator/createABI");
const writeProgram_1 = require("../generator/writeProgram");
async function compile(ctx, name, basename, contractCodes) {
    const abi = (0, createABI_1.createABI)(ctx, name);
    const output = await (0, writeProgram_1.writeProgram)(ctx, abi, basename, contractCodes, false);
    const cOutput = output;
    return { output: cOutput, ctx };
}
