"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyPath = exports.asString = exports.fromString = void 0;
const errors_1 = require("../error/errors");
const array_1 = require("../utils/array");
// Witness tag. Do not use, do not export.
const pathTag = Symbol("path");
/**
 * Constructor for relative paths
 */
const RelativePath = (stepsUp, segments) => {
    if (stepsUp < 0) {
        (0, errors_1.throwInternalCompilerError)("Negative number of ../ in path");
    }
    const result = {
        [pathTag]: true,
        stepsUp,
        segments: Object.freeze(segments),
    };
    return Object.freeze(result);
};
/**
 * Convert raw string with relative POSIX path into RelativePath
 */
const fromString = (raw) => {
    return raw.split("/").map(parseSegment).reduce(appendPath, exports.emptyPath);
};
exports.fromString = fromString;
/**
 * Convert RelativePath to string.
 */
const asString = ({ stepsUp, segments }) => {
    return [...(0, array_1.repeat)("..", stepsUp), ...segments].join("/");
};
exports.asString = asString;
/**
 * Empty path, equivalent to "."
 */
exports.emptyPath = RelativePath(0, []);
/**
 * Combine two relative paths
 */
const appendPath = (left, right) => {
    const delta = right.stepsUp - left.segments.length;
    return RelativePath(left.stepsUp + Math.max(0, delta), [
        ...left.segments.slice(0, Math.max(0, -delta)),
        ...right.segments,
    ]);
};
const parseSegment = (segment) => {
    if (segment === "..") {
        return RelativePath(1, []);
    }
    if (segment === "." || segment === "") {
        return exports.emptyPath;
    }
    return RelativePath(0, [segment]);
};
