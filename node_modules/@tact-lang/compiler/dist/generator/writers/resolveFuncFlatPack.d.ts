import type { TypeDescription, TypeRef } from "../../types/types";
import type { WriterContext } from "../Writer";
export declare function resolveFuncFlatPack(descriptor: TypeRef | TypeDescription | string, name: string, ctx: WriterContext, optional?: boolean): string[];
