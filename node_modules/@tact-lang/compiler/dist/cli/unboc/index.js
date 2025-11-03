"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const fs_1 = require("fs");
const opcode_1 = require("@tact-lang/opcode");
const arg_consumer_1 = require("../arg-consumer");
const arg_parser_1 = require("../arg-parser");
const logger_1 = require("../logger");
const error_schema_1 = require("./error-schema");
const version_1 = require("../version");
const unbocVersion = "0.0.1";
const main = () => {
    const Log = (0, logger_1.CliLogger)();
    const Errors = (0, error_schema_1.UnbocErrors)(Log.log);
    try {
        const argv = process.argv.slice(2);
        processArgs(Errors, argv);
    }
    catch (e) {
        Errors.unexpected(e);
    }
    if (Log.hadErrors()) {
        // https://nodejs.org/docs/v20.12.1/api/process.html#exit-codes
        process.exit(30);
    }
};
exports.main = main;
const processArgs = (Errors, argv) => {
    const Parser = (0, arg_parser_1.ArgParser)(Errors);
    const getArgs = ArgSchema(Parser);
    const match = getArgs(argv);
    if (match.kind === "ok") {
        const Args = (0, arg_consumer_1.ArgConsumer)(Errors, match.value);
        parseArgs(Errors, Args);
    }
    else {
        showHelp();
    }
};
const ArgSchema = (Parser) => {
    return Parser.tokenizer
        .add(Parser.boolean("no-compute-refs", undefined))
        .add(Parser.boolean("no-aliases", undefined))
        .add(Parser.boolean("show-bitcode", undefined))
        .add(Parser.boolean("version", "v"))
        .add(Parser.boolean("help", "h"))
        .add(Parser.immediate).end;
};
const showHelp = () => {
    console.log(`
    Usage
      $ unboc [...flags] BOC-FILE

    Flags
          --no-compute-refs       Don't extract CALLREF to separate functions for better readability
          --no-aliases            Don't replace instructions with aliases for better readability
          --show-bitcode          Show HEX bitcode after instruction
      -v, --version               Print unboc version and exit
      -h, --help                  Display this text and exit

    Examples
      $ unboc --version
      ${unbocVersion}`);
};
const parseArgs = (Errors, Args) => {
    if (Args.single("help")) {
        if (noUnknownParams(Errors, Args)) {
            showHelp();
        }
        return;
    }
    if (Args.single("version")) {
        if (noUnknownParams(Errors, Args)) {
            console.log(unbocVersion);
            (0, version_1.showCommit)();
        }
        return;
    }
    const filePath = Args.single("immediate");
    if (filePath) {
        const boc = (0, fs_1.readFileSync)(filePath);
        const noComputeRefs = Args.single("no-compute-refs") ?? false;
        const noAliases = Args.single("no-aliases") ?? false;
        const outputBitcodeAfterInstruction = Args.single("show-bitcode") ?? false;
        const disasmResult = decompileAll(Buffer.from(boc), !noComputeRefs, !noAliases, outputBitcodeAfterInstruction);
        if (disasmResult) {
            console.log(disasmResult);
        }
        return;
    }
    if (noUnknownParams(Errors, Args)) {
        showHelp();
    }
};
const noUnknownParams = (Errors, Args) => {
    const leftoverArgs = Args.leftover();
    if (leftoverArgs.length === 0) {
        return true;
    }
    for (const argument of leftoverArgs) {
        Errors.unexpectedArgument(argument);
    }
    showHelp();
    return false;
};
const decompileAll = (src, computeRefs, useAliases, outputBitcodeAfterInstruction) => {
    const cell = opcode_1.Cell.fromBoc(src).at(0);
    if (typeof cell === "undefined")
        return undefined;
    const program = (0, opcode_1.disassembleRoot)(cell, { computeRefs });
    return opcode_1.AssemblyWriter.write(program, {
        useAliases,
        outputBitcodeAfterInstruction,
    });
};
