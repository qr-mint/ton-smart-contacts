"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalLogger = exports.CliLogger = void 0;
const logger_util_1 = require("../error/logger-util");
const string_util_1 = require("../error/string-util");
const process_1 = require("process");
const errors_1 = require("../error/errors");
const CliLogger = () => {
    let hadErrors = false;
    const log = (message) => {
        hadErrors = true;
        console.log(message);
    };
    return {
        log,
        hadErrors: () => hadErrors,
    };
};
exports.CliLogger = CliLogger;
const TerminalLogger = (pathApi, verbosity, ansi, compile) => {
    // path is displayed relative to cwd(), so that in VSCode terminal it's a link
    const showResolvedPath = (path) => {
        const relativePath = pathApi.normalize(pathApi.relative((0, process_1.cwd)(), path));
        const fixedPath = relativePath.startsWith(".")
            ? relativePath
            : `.${pathApi.sep}${relativePath}`;
        return ansi.blue(fixedPath);
    };
    const termIface = {
        internal: (message) => {
            console.log(ansi.red("Internal compiler error: ") +
                message +
                `\nPlease report at https://github.com/tact-lang/tact/issues`);
        },
        error: (message) => {
            console.log(ansi.red("Error: ") + message);
        },
        warn: (message) => {
            if (verbosity === "warn" || verbosity === "info") {
                console.log(ansi.yellow("Warning: ") + message);
            }
        },
        info: (message) => {
            if (verbosity === "info") {
                console.log(message);
            }
        },
        text: (parts, ...subst) => (0, string_util_1.showTemplate)(parts, subst),
        path: showResolvedPath,
        locatedId: (id) => id,
        expected: string_util_1.showExpectedText,
        atPath: (path, message) => `${showResolvedPath(path)}: ${message}`,
        atRange: (path, code, range, message) => (0, string_util_1.printError)({
            path: showResolvedPath(path),
            code,
            message,
            range,
            onInternalError: errors_1.throwInternal,
            ansiMarkup: ansi,
        }),
        onExit: () => {
            // Now the only thing left to handle is ExitError, which
            // just exits the application
            process.exit(30);
        },
    };
    return (0, logger_util_1.makeLogger)(termIface, compile);
};
exports.TerminalLogger = TerminalLogger;
