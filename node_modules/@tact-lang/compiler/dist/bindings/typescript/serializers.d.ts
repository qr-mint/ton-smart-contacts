import type { ABITypeRef } from "@ton/core";
import type { Writer } from "../../utils/Writer";
type Serializer<T> = {
    tsType: (v: T) => string;
    tsLoad: (v: T, slice: string, field: string, w: Writer) => void;
    tsLoadTuple: (v: T, reader: string, field: string, w: Writer, fromGet: boolean) => void;
    tsStore: (v: T, builder: string, field: string, w: Writer) => void;
    tsStoreTuple: (v: T, to: string, field: string, w: Writer) => void;
    abiMatcher: (src: ABITypeRef) => T | null;
};
export declare const serializers: Serializer<any>[];
export {};
