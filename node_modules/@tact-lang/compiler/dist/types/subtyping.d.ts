import type { TypeRef } from "./types";
export declare function isAssignable(src: TypeRef, to: TypeRef): boolean;
export declare function moreGeneralType(type1: TypeRef, type2: TypeRef): TypeRef | null;
