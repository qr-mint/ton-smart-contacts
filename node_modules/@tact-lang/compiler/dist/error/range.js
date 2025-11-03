"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shift = exports.intersect = void 0;
/**
 * Intersect ranges
 */
const intersect = (a, b) => {
    return {
        start: Math.max(a.start, b.start),
        end: Math.min(a.end, b.end),
    };
};
exports.intersect = intersect;
/**
 * Shift both sides of range by scalar
 */
const shift = (a, b) => {
    return {
        start: a.start + b,
        end: a.end + b,
    };
};
exports.shift = shift;
