import type { ImportPath } from "../ast/ast";
import type { VirtualFileSystem } from "../vfs/VirtualFileSystem";
import type { ItemOrigin, Language, Source } from "./source";
type ResolveLibraryArgs = {
    readonly importPath: ImportPath;
    readonly sourceFrom: Source;
    readonly project: VirtualFileSystem;
    readonly stdlib: VirtualFileSystem;
};
type ResolveLibrarySuccess = {
    readonly ok: true;
    readonly path: string;
    readonly language: Language;
    readonly origin: ItemOrigin;
};
type ResolveLibraryFailure = {
    ok: false;
};
type ResolveLibraryResult = ResolveLibrarySuccess | ResolveLibraryFailure;
export declare function resolveLibrary({ importPath, sourceFrom, project, stdlib, }: ResolveLibraryArgs): ResolveLibraryResult;
export {};
