/**
 * Describes DSL for displaying errors
 */
import type { SrcInfo } from "../grammar";
/**
 * @deprecated Use `Logger` from src/error/logger-util.ts
 */
export interface ErrorDisplay<T> {
    at: (loc: SrcInfo, body: T) => T;
    text: (text: string) => T;
    sub: (text: TemplateStringsArray, ...subst: T[]) => T;
    link: (text: string, loc: SrcInfo) => T;
}
