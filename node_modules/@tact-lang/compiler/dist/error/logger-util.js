"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLogger = exports.rethrowWithPath = exports.handleTopLevelErrors = exports._ignore = exports._exit = exports._ExitError = void 0;
const async_util_1 = require("./async-util");
const errors_1 = require("./errors");
/**
 * (Co-)map message types of base logger
 *
 * Used when we need to add something to every message
 */
const mapBaseLogger = (log, f) => ({
    exitIfErrored: log.exitIfErrored,
    internal: (m) => log.internal(f(m)),
    error: (m) => log.error(f(m)),
    warn: (m) => {
        log.warn(f(m));
    },
    info: (m) => {
        log.info(f(m));
    },
});
/**
 * Error used to stop compilation
 *
 * @private Do not use outside of this file!
 */
class _ExitError extends Error {
}
exports._ExitError = _ExitError;
/**
 * Stop compilation
 *
 * @private Do not use outside of this file!
 */
const _exit = () => {
    throw new _ExitError();
};
exports._exit = _exit;
/**
 * Do not stop compilation
 *
 * @private Do not use outside of this file!
 */
const _ignore = () => { };
exports._ignore = _ignore;
/**
 * Used internally to handle errors that bubbled to root logger
 */
const handleTopLevelErrors = (log, cb, onExit) => {
    // `catchUncolored` is instrumental here, to allow `T` to be either
    // regular value or a `Promise`
    return (0, async_util_1.catchUncolored)(() => (0, async_util_1.catchUncolored)(cb, (e) => {
        if (e instanceof _ExitError) {
            // Exit will be handled below
            throw e;
        }
        else if (e instanceof errors_1.TactInternalError) {
            // Format `throwInternal()` and rethrow it as regular error
            // Will throw ExitError
            return log.internal(log.text `${e.formattedMessage}`);
        }
        else {
            // For any other error, convert it to string and rethrow as
            // regular error. Will throw ExitError
            const text = e instanceof Error ? e.toString() : String(e);
            return log.internal(log.text `Unhandled: ${text}`);
        }
    }), (e) => {
        if (e instanceof _ExitError) {
            return onExit();
        }
        else {
            // impossible, but throw anyway
            throw e;
        }
    });
};
exports.handleTopLevelErrors = handleTopLevelErrors;
/**
 * Messages of errors that are `throw`n should at least be expanded with
 * context, in while file they happened
 */
const rethrowWithPath = (error, path) => {
    if (error instanceof errors_1.TactInternalError) {
        error.formattedMessage = `${error.formattedMessage}\nwhile compiling ${path}`;
    }
    else if (error instanceof Error) {
        error.message = `${error.message}\nwhile compiling ${path}`;
    }
    throw error;
};
exports.rethrowWithPath = rethrowWithPath;
const createChildLoggers = (getBase) => {
    let hadErrors = false;
    return (onError) => {
        const base = getBase(onError);
        return {
            ...base,
            exitIfErrored: () => {
                if (hadErrors)
                    return (0, exports._exit)();
                // If this scope is not in error state, maybe its parent is
                base.exitIfErrored();
            },
            internal: (m) => {
                // We won't use this value, because `.internal()` immediately
                // exits the application anyway, but it's better to be consistent
                hadErrors = true;
                return base.internal(m);
            },
            error: (m) => {
                hadErrors = true;
                return base.error(m);
            },
        };
    };
};
/**
 * Create top-level single-error and multi-error loggers
 */
const makeBaseLoggers = (iface) => createChildLoggers((onError) => ({
    exitIfErrored: () => { },
    internal: (message) => {
        iface.internal(message);
        // Internal errors directly exit the application
        return (0, exports._exit)();
    },
    error: (message) => {
        iface.error(message);
        // Behavior of this call distinguished single and multiple errors
        // if `onError` throws, it's a single error
        return onError();
    },
    warn: iface.warn,
    info: iface.info,
}));
/**
 * Create user-facing logger from its internal representation and
 * application entrypoint
 */
const makeLogger = (iface, compile) => {
    // Create a simple text logger
    const formatter = {
        text: iface.text,
        path: iface.path,
        expected: iface.expected,
        locatedId: iface.locatedId,
    };
    // Create a logger with a given source file in context
    const makeSourceLogger = (path, code, baseLoggers, handle) => ({
        ...formatter,
        ...mapBaseLogger(baseLoggers(handle), (m) => iface.atPath(path, m)),
        at: (range) => mapBaseLogger(baseLoggers(handle), (m) => iface.atRange(path, code, range, m)),
        recover: (cb) => cb(makeSourceLogger(path, code, baseLoggers, exports._ignore)),
    });
    // Create a function that returns a logger with source file context, and also
    // add context to all the native JS errors that pass through it
    const makeSourceFunction = (baseLoggers, handle) => (path, code, cb) => {
        // `catchUncolored` is instrumental here, to allow `T` to be either
        // regular value or a `Promise`
        return (0, async_util_1.catchUncolored)(() => cb(makeSourceLogger(path, code, createChildLoggers(baseLoggers), handle)), (error) => (0, exports.rethrowWithPath)(error, path));
    };
    // Create top-level logger, for one or several error messages, depending on `handle`
    const makeLogger = (baseLoggers, handle) => ({
        ...formatter,
        ...baseLoggers(handle),
        source: makeSourceFunction(baseLoggers, handle),
        recover: makeRecover(baseLoggers),
    });
    // Create a top-level multi-error logger
    const makeRecover = (baseLoggers) => (cb) => {
        return cb(makeLogger(createChildLoggers(baseLoggers), exports._ignore));
    };
    // Create top-level one-error logger
    const logger = makeLogger(makeBaseLoggers(iface), exports._exit);
    // Run application, catch all uncaught/internal errors and dispatch them as errors in log
    return (0, exports.handleTopLevelErrors)(logger, () => {
        const result = compile(logger);
        logger.exitIfErrored();
        return result;
    }, iface.onExit);
};
exports.makeLogger = makeLogger;
