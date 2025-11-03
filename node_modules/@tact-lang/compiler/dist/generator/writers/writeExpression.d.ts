import type * as A from "../../ast/ast";
import type { WriterContext } from "../Writer";
export declare function writeValue(val: A.AstLiteral, wCtx: WriterContext): string;
export declare function writePathExpression(path: A.AstId[]): string;
export declare function writeExpression(f: A.AstExpression, wCtx: WriterContext): string;
export declare function writeTypescriptValue(val: A.AstLiteral | undefined): string | undefined;
