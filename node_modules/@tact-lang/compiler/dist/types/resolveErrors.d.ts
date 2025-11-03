import type { CompilerContext } from "../context/context";
import type { FactoryAst } from "../ast/ast-helpers";
type Exception = {
    value: string;
    id: number;
};
export declare function resolveErrors(ctx: CompilerContext, Ast: FactoryAst): CompilerContext;
export declare function getAllErrors(ctx: CompilerContext): Exception[];
export declare function getErrorId(value: string, ctx: CompilerContext): number;
export {};
