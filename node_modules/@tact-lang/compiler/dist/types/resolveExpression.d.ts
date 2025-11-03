import type * as A from "../ast/ast";
import type { CompilerContext } from "../context/context";
import type { TypeRef } from "./types";
import type { StatementContext } from "./resolveStatements";
export declare function getExpType(ctx: CompilerContext, exp: A.AstExpression): TypeRef;
export declare function resolveExpression(exp: A.AstExpression, sctx: StatementContext, ctx: CompilerContext): CompilerContext;
export declare function getAllExpressionTypes(ctx: CompilerContext): [string, string][];
