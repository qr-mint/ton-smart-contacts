import type { CompilerContext } from "../context/context";
import type { VirtualFileSystem } from "../vfs/VirtualFileSystem";
import type { AstModule } from "../ast/ast";
import type { FactoryAst } from "../ast/ast-helpers";
import type { Parser } from "../grammar";
export declare function precompile(ctx: CompilerContext, project: VirtualFileSystem, stdlib: VirtualFileSystem, entrypoint: string, parser: Parser, ast: FactoryAst, parsedModules?: AstModule[]): CompilerContext;
