import type { Project } from "../config/parseConfig";
import { CompilerContext } from "../context/context";
import type { ILogger } from "../context/logger";
import type { VirtualFileSystem } from "../vfs/VirtualFileSystem";
import type { FactoryAst } from "../ast/ast-helpers";
import type { TactErrorCollection } from "../error/errors";
import type { Parser } from "../grammar";
export declare function enableFeatures(ctx: CompilerContext, logger: ILogger, config: Project): CompilerContext;
export declare function build(args: {
    config: Project;
    project: VirtualFileSystem;
    stdlib: string | VirtualFileSystem;
    logger?: ILogger;
    parser?: Parser;
    ast?: FactoryAst;
}): Promise<{
    ok: boolean;
    error: TactErrorCollection[];
}>;
