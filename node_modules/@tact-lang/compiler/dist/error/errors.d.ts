import type { AstFuncId, AstId, AstTypeId } from "../ast/ast";
import type { SrcInfo } from "../grammar";
export declare class TactInternalError extends Error {
    formattedMessage: string;
    constructor(formattedMessage: string);
}
/**
 * Throw internal error
 */
export declare const throwInternal: (string: string) => never;
/**
 * @deprecated Use log.error()
 */
export declare class TactError extends Error {
    readonly loc?: SrcInfo;
    constructor(message: string, loc?: SrcInfo);
}
/**
 * Any regular compilation error shown to user:
 * parsing, typechecking, code generation
 *
 * @deprecated Use log.error()
 */
export declare class TactCompilationError extends TactError {
    constructor(message: string, loc?: SrcInfo);
}
/**
 * @deprecated Use throwInternal(), or log.internal() if context is known
 */
export declare class TactInternalCompilerError extends TactError {
    constructor(message: string, loc?: SrcInfo);
}
export declare class TactConstEvalError extends TactCompilationError {
    fatal: boolean;
    constructor(message: string, fatal: boolean, loc: SrcInfo);
}
/**
 * @deprecated Use log.source() and log.at().error()
 */
export declare function locationStr(sourceInfo: SrcInfo): string;
/**
 * @deprecated Use log.error()
 */
export declare function throwCompilationError(message: string, source?: SrcInfo): never;
/**
 * @deprecated Use throwInternal(), or log.internal() if context is known
 */
export declare function throwInternalCompilerError(message: string, source?: SrcInfo): never;
export declare function throwConstEvalError(message: string, fatal: boolean, source: SrcInfo): never;
/**
 * @deprecated Use loc.locatedId()
 */
export declare function idTextErr(ident: AstId | AstFuncId | AstTypeId | string): string;
/**
 * @deprecated Use `LogEntry` for external tooling
 */
export type TactErrorCollection = Error | TactCompilationError | TactInternalCompilerError | TactConstEvalError;
