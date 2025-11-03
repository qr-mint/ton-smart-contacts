"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnbocErrors = void 0;
const UnbocErrors = (log) => {
    return {
        argumentHasParameter: (param, argName) => {
            log(`Expected ${param} ${argName}`);
        },
        unexpectedArgument: (text) => {
            log(`Unexpected ${typeof text === "undefined" ? "end of arguments" : text}`);
        },
        duplicateArgument: (name) => {
            log(`Duplicate ${name} argument. Only first argument will be used`);
        },
        unexpected: (error) => {
            log(`Unexpected error: ${error instanceof Error ? error.toString() : String(error)}`);
        },
    };
};
exports.UnbocErrors = UnbocErrors;
