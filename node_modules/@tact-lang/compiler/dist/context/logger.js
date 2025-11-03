"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    /** Logging is turned off */
    LogLevel[LogLevel["NONE"] = 0] = "NONE";
    /** Logs only error messages */
    LogLevel[LogLevel["ERROR"] = 1] = "ERROR";
    /** Logs warning and error messages */
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    /** Logs informational, warning, and error messages */
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
    /** Logs debugging, informational, warning, and error messages */
    LogLevel[LogLevel["DEBUG"] = 4] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
const logLevelToMethodName = {
    [LogLevel.NONE]: null,
    [LogLevel.ERROR]: "error",
    [LogLevel.WARN]: "warn",
    [LogLevel.INFO]: "info",
    [LogLevel.DEBUG]: "debug",
};
function getLoggingMethod(level) {
    return logLevelToMethodName[level];
}
class Logger {
    level;
    logMethods;
    constructor(level = LogLevel.INFO) {
        this.level = level;
        this.logMethods = {
            debug: console.log,
            info: console.log,
            warn: console.warn,
            error: console.error,
        };
    }
    log(level, message) {
        if (this.level === LogLevel.NONE) {
            return;
        }
        if (message instanceof Error) {
            message = message.stack ?? message.message;
        }
        else {
            message = message.toString();
        }
        if (level > this.level)
            return;
        const loggingMethod = getLoggingMethod(level);
        if (!loggingMethod)
            return;
        this.logMethods[loggingMethod](message);
    }
    debug(message) {
        this.log(LogLevel.DEBUG, message);
    }
    info(message) {
        this.log(LogLevel.INFO, message);
    }
    warn(message) {
        this.log(LogLevel.WARN, message);
    }
    error(message) {
        this.log(LogLevel.ERROR, message);
    }
    setLevel(level) {
        this.level = level;
    }
}
exports.Logger = Logger;
