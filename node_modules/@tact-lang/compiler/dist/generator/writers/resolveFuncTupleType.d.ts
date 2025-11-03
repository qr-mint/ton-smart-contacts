import type { TypeDescription, TypeRef } from "../../types/types";
import type { WriterContext } from "../Writer";
export declare function resolveFuncTupleType(descriptor: TypeRef | TypeDescription | string, ctx: WriterContext): string;
