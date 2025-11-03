import type * as A from "../../ast/ast";
import type { FunctionDescription, TypeRef } from "../../types/types";
import type { WriterContext } from "../Writer";
export declare function writeCastedExpression(expression: A.AstExpression, to: TypeRef, ctx: WriterContext): string;
export declare function writeStatement(f: A.AstStatement, self: string | null, returns: TypeRef | null, ctx: WriterContext): void;
export declare function writeFunction(f: FunctionDescription, ctx: WriterContext): void;
export declare function writeGetter(f: FunctionDescription, wCtx: WriterContext): void;
