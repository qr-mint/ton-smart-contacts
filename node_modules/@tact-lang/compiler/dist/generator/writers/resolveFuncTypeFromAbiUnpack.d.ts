import type { ABITypeRef } from "@ton/core";
import type { WriterContext } from "../Writer";
export declare function resolveFuncTypeFromAbiUnpack(name: string, fields: {
    name: string;
    type: ABITypeRef;
}[], ctx: WriterContext): string;
