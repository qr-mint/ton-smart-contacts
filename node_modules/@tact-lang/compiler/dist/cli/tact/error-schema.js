"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliErrors = void 0;
const CliErrors = (log) => {
    return {
        /**
         * @deprecated Because there are incompatible loggers, we have to inform
         * top-level logger that there was an error.
         *
         * Will be removed along with { ok: boolean } returns from `build`
         */
        setHadErrors: () => {
            log("");
        },
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
        configNotFound: (path) => {
            log(`Unable to find config file at ${path}`);
        },
        configError: (path, text) => {
            log(`Config error (${path}): ${text}`);
        },
        incompatibleFlags: () => {
            log(`At most one of --check, --func, and --withDecompilation can be set at the same time`);
        },
        noSuchProject: (name) => {
            log(`Unable to find project ${name}`);
        },
    };
};
exports.CliErrors = CliErrors;
