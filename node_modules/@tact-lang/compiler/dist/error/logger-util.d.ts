import type { Range } from "./range";
/**
 * Methods for formatting an error message
 */
export interface Formatter<M> {
    /**
     * Substitutions into template literal
     * Creates a single message, possible with some parts of it rendered in a
     * different way.
     */
    readonly text: (parts: TemplateStringsArray, ...subst: readonly (string | M)[]) => M;
    /**
     * Absolute path token
     * Displayed in blue in CLI and as link in IDE
     * Displayed relative to `cwd` in CLI or workspace root in IDE
     * External tooling can use absolute path in other ways
     */
    readonly path: (path: string) => M;
    /**
     * Refer to `id` in a `path` file at `range`
     * In IDE should display as a link with `id` as text
     */
    readonly locatedId: (id: string, path: string, range: Range) => M;
    /**
     * Token for a list of expected strings
     */
    readonly expected: (guesses: ReadonlySet<string>) => M;
}
/**
 * Basic logger interface
 */
export interface BaseLogger<M, R> {
    /**
     * Throw internal error
     *
     * If internal error is not related to currently source and range,
     * `internal()` from `errors.ts` will work as well
     */
    readonly internal: (message: M) => never;
    /**
     * Throw compilation error
     */
    readonly error: (message: M) => R;
    /**
     * Display a warning
     */
    readonly warn: (message: M) => void;
    /**
     * Log something not that important
     */
    readonly info: (message: M) => void;
    /**
     * Even if using error recovery, exit compilation right now and there
     *
     * Used at the end of compilation stage, if continuing compilation is
     * considered dangerous due to potentially broken internal compiler state
     */
    readonly exitIfErrored: () => void;
}
/**
 * Logger that knows about currently compiled file
 */
export interface SourceLogger<M, R> extends Formatter<M>, BaseLogger<M, R> {
    /**
     * Choose range where an error will be shown
     */
    at: (range: Range) => BaseLogger<M, R>;
    /**
     * Handle multiple errors in callback without throwing them
     */
    recover: <T>(cb: (logger: SourceLogger<M, void>) => T) => T;
}
/**
 * Top-level logger
 */
export interface Logger<M, R> extends Formatter<M>, BaseLogger<M, R> {
    /**
     * Set currently compiled source in logging context
     */
    source: <T>(path: string, code: string, cb: (logger: SourceLogger<M, R>) => T) => T;
    /**
     * Handle multiple errors in callback without throwing them
     */
    recover: <T>(cb: (logger: Logger<M, void>) => T) => T;
}
/**
 * Error used to stop compilation
 *
 * @private Do not use outside of this file!
 */
export declare class _ExitError extends Error {
}
/**
 * Stop compilation
 *
 * @private Do not use outside of this file!
 */
export declare const _exit: () => never;
/**
 * Do not stop compilation
 *
 * @private Do not use outside of this file!
 */
export declare const _ignore: () => void;
/**
 * Used internally to handle errors that bubbled to root logger
 */
export declare const handleTopLevelErrors: <M, T, U>(log: Logger<M, unknown>, cb: () => T, onExit: () => U) => T | U;
/**
 * Messages of errors that are `throw`n should at least be expanded with
 * context, in while file they happened
 */
export declare const rethrowWithPath: (error: unknown, path: string) => never;
/**
 * Set of handlers that are different between logger implementations
 *
 * This interface is a simplified version of logger, so that we can implement
 * a new kind of logger without copying complex error message builders
 */
export interface LoggerHandlers<M, R> {
    readonly internal: (message: M) => void;
    readonly error: (message: M) => void;
    readonly warn: (message: M) => void;
    readonly info: (message: M) => void;
    readonly text: (parts: TemplateStringsArray, ...subst: readonly (string | M)[]) => M;
    readonly path: (path: string) => M;
    readonly locatedId: (id: string, path: string, range: Range) => M;
    readonly expected: (guesses: ReadonlySet<string>) => M;
    readonly atPath: (path: string, message: M) => M;
    readonly atRange: (path: string, code: string, range: Range, message: M) => M;
    readonly onExit: () => R;
}
/**
 * Create user-facing logger from its internal representation and
 * application entrypoint
 */
export declare const makeLogger: <M, T>(iface: LoggerHandlers<M, T>, compile: (log: Logger<M, never>) => T) => T;
