"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runServer = void 0;
const async_util_1 = require("../error/async-util");
const logger_util_1 = require("../error/logger-util");
/**
 * Logger for running Tact as a library
 */
const runServer = (compile) => {
    const log = [];
    const jsonIface = {
        internal: (message) => log.push({ level: "internal", message }),
        error: (message) => log.push({ level: "error", message }),
        warn: (message) => log.push({ level: "warn", message }),
        info: (message) => log.push({ level: "info", message }),
        path: (path) => ({ kind: "path", path }),
        locatedId: (id, path, range) => ({
            kind: "locatedId",
            id,
            path,
            range,
        }),
        expected: (values) => ({ kind: "expected", values }),
        text: (parts, ...subst) => ({ kind: "text", parts: [...parts], subst }),
        atPath: (path, message) => ({
            kind: "source",
            path,
            message,
            range: undefined,
        }),
        atRange: (path, code, range, message) => ({
            kind: "source",
            path,
            message,
            range,
        }),
        onExit: () => undefined,
    };
    return (0, async_util_1.thenUncolored)((0, logger_util_1.makeLogger)(jsonIface, compile), () => log);
};
exports.runServer = runServer;
