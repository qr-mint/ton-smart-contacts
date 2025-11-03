import type { ItemOrigin } from "../imports/source";
type LineAndColumnInfo = {
    lineNum: number;
    colNum: number;
    toString(...ranges: number[][]): string;
};
type Interval = {
    contents: string;
    getLineAndColumnMessage(): string;
    getLineAndColumn(): LineAndColumnInfo;
    startIdx: number;
    endIdx: number;
};
declare const srcInfoSymbol: unique symbol;
export declare const isSrcInfo: (t: unknown) => t is SrcInfo;
export interface SrcInfo {
    file: string | null;
    contents: string;
    interval: Interval;
    origin: ItemOrigin;
    /**
     * Tag so that custom snapshot serializer can distinguish it
     */
    [srcInfoSymbol]: true;
    /**
     * toJSON method is provided, so that it's not serialized into snapshots
     */
    toJSON: () => object;
}
export declare const srcInfoEqual: (left: SrcInfo, right: SrcInfo) => boolean;
export declare const getSrcInfo: (sourceString: string, startIdx: number, endIdx: number, file: string | null, origin: ItemOrigin) => SrcInfo;
export declare const dummySrcInfo: SrcInfo;
export {};
