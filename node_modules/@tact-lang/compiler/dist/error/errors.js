"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TactConstEvalError = exports.TactInternalCompilerError = exports.TactCompilationError = exports.TactError = exports.throwInternal = exports.TactInternalError = void 0;
exports.locationStr = locationStr;
exports.throwCompilationError = throwCompilationError;
exports.throwInternalCompilerError = throwInternalCompilerError;
exports.throwConstEvalError = throwConstEvalError;
exports.idTextErr = idTextErr;
const path_1 = __importDefault(require("path"));
const process_1 = require("process");
class TactInternalError extends Error {
    formattedMessage;
    constructor(formattedMessage) {
        super();
        this.formattedMessage = formattedMessage;
    }
}
exports.TactInternalError = TactInternalError;
/**
 * Throw internal error
 */
const throwInternal = (string) => {
    throw new TactInternalError(string);
};
exports.throwInternal = throwInternal;
/**
 * @deprecated Use log.error()
 */
class TactError extends Error {
    loc;
    constructor(message, loc) {
        super(message);
        this.loc = loc;
    }
}
exports.TactError = TactError;
/**
 * Any regular compilation error shown to user:
 * parsing, typechecking, code generation
 *
 * @deprecated Use log.error()
 */
class TactCompilationError extends TactError {
    constructor(message, loc) {
        super(message, loc);
    }
}
exports.TactCompilationError = TactCompilationError;
/**
 * @deprecated Use throwInternal(), or log.internal() if context is known
 */
class TactInternalCompilerError extends TactError {
    constructor(message, loc) {
        super(message, loc);
    }
}
exports.TactInternalCompilerError = TactInternalCompilerError;
class TactConstEvalError extends TactCompilationError {
    fatal = false;
    constructor(message, fatal, loc) {
        super(message, loc);
        this.fatal = fatal;
    }
}
exports.TactConstEvalError = TactConstEvalError;
/**
 * @deprecated Use log.source() and log.at().error()
 */
function locationStr(sourceInfo) {
    if (sourceInfo.file) {
        const loc = sourceInfo.interval.getLineAndColumn();
        const file = path_1.default.relative((0, process_1.cwd)(), sourceInfo.file);
        return `${file}:${loc.lineNum}:${loc.colNum}: `;
    }
    else {
        return "";
    }
}
/**
 * @deprecated Use log.error()
 */
function throwCompilationError(message, source) {
    const msg = source === undefined
        ? message
        : `${locationStr(source)}${message}\n${source.interval.getLineAndColumnMessage()}`;
    throw new TactCompilationError(msg, source);
}
/**
 * @deprecated Use throwInternal(), or log.internal() if context is known
 */
function throwInternalCompilerError(message, source) {
    const msg = `[INTERNAL COMPILER ERROR]: ${message}\nPlease report at https://github.com/tact-lang/tact/issues`;
    throw source === undefined
        ? new TactInternalCompilerError(msg)
        : new TactInternalCompilerError(`${locationStr(source)}\n${msg}\n${source.interval.getLineAndColumnMessage()}`, source);
}
function throwConstEvalError(message, fatal, source) {
    throw new TactConstEvalError(`${locationStr(source)}${message}\n${source.interval.getLineAndColumnMessage()}`, fatal, source);
}
/**
 * @deprecated Use loc.locatedId()
 */
function idTextErr(ident) {
    if (typeof ident === "string") {
        return `"${ident}"`;
    }
    return `"${ident.text}"`;
}
