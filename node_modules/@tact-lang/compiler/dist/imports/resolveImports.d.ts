import type { Parser } from "../grammar";
import type { VirtualFileSystem } from "../vfs/VirtualFileSystem";
import type { Source } from "./source";
type ResolveImportsArgs = {
    readonly entrypoint: string;
    readonly project: VirtualFileSystem;
    readonly stdlib: VirtualFileSystem;
    readonly parser: Parser;
};
export declare function resolveImports({ entrypoint, parser, project, stdlib, }: ResolveImportsArgs): {
    tact: Source[];
    func: Source[];
};
export {};
