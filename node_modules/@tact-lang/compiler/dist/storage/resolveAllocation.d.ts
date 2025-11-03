import type { CompilerContext } from "../context/context";
import type { TypeDescription } from "../types/types";
import type { StorageAllocation } from "./StorageAllocation";
export declare function getAllocation(ctx: CompilerContext, name: string): StorageAllocation;
export declare function getAllocations(ctx: CompilerContext): {
    allocation: StorageAllocation;
    type: TypeDescription;
}[];
export declare function getSortedTypes(ctx: CompilerContext): TypeDescription[];
export declare function resolveAllocations(ctx: CompilerContext): CompilerContext;
