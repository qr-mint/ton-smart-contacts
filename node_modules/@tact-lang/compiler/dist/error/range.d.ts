/**
 * Range of source code positions
 * 0-based
 * `end` points to position just after the end of range
 */
export type Range = {
    start: number;
    end: number;
};
/**
 * Intersect ranges
 */
export declare const intersect: (a: Range, b: Range) => Range;
/**
 * Shift both sides of range by scalar
 */
export declare const shift: (a: Range, b: number) => {
    start: number;
    end: number;
};
