import type { Address, Cell, Slice } from "@ton/core";
import type { WriterContext } from "../Writer";
export declare function writeString(str: string, ctx: WriterContext): string;
export declare function writeAddress(address: Address, ctx: WriterContext): string;
export declare function writeCell(cell: Cell, ctx: WriterContext): string;
export declare function writeSlice(slice: Slice, ctx: WriterContext): string;
