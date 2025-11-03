import type { Range } from "./range";
/**
 * Show "Expected Foo, Bar" message
 */
export declare const showExpectedText: (expected: ReadonlySet<string>) => string;
/**
 * Concatenate template literal back into string
 */
export declare const showTemplate: (parts: readonly string[], subst: readonly string[]) => string;
export type Colors = {
    readonly gray: (s: string) => string;
    readonly red: (s: string) => string;
    readonly yellow: (s: string) => string;
};
export type PrintErrorParams = {
    /**
     * Rendered absolute path to source file
     */
    readonly path: string;
    /**
     * Source code
     */
    readonly code: string;
    /**
     * Rendered message
     */
    readonly message: string;
    /**
     * 0-based position range [start; end[
     */
    readonly range: Range;
    /**
     * Throw internal error
     */
    readonly onInternalError?: (error: string) => void;
    /**
     * Use colors
     */
    readonly ansiMarkup?: Colors;
};
/**
 * Print error message in a source file
 * @param path
 * @param code
 * @param range
 * @param message
 * @param onInternalError
 */
export declare function printError({ path, code, message, range, onInternalError, ansiMarkup: ansi, }: PrintErrorParams): string;
