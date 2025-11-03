import type { TypeDescription, TypeRef } from "../../types/types";
import type { WriterContext } from "../Writer";
export declare function resolveFuncFlatTypes(descriptor: TypeRef | TypeDescription | string, ctx: WriterContext, optional?: boolean): string[];
