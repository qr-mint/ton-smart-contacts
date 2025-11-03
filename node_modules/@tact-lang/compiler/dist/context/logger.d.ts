export declare enum LogLevel {
    /** Logging is turned off */
    NONE = 0,
    /** Logs only error messages */
    ERROR = 1,
    /** Logs warning and error messages */
    WARN = 2,
    /** Logs informational, warning, and error messages */
    INFO = 3,
    /** Logs debugging, informational, warning, and error messages */
    DEBUG = 4
}
type messageType = string | Error;
/**
 * Interface defining the logging methods used by the `Logger` class, enabling
 * custom logger implementations.
 */
export interface ILogger {
    debug: (message: messageType) => void;
    info: (message: messageType) => void;
    warn: (message: messageType) => void;
    error: (message: messageType) => void;
}
export declare class Logger {
    private level;
    private logMethods;
    constructor(level?: LogLevel);
    protected log(level: LogLevel, message: messageType): void;
    debug(message: messageType): void;
    info(message: messageType): void;
    warn(message: messageType): void;
    error(message: messageType): void;
    setLevel(level: LogLevel): void;
}
export {};
