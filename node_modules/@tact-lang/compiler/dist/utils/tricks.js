"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keys = exports.entries = exports.singleton = exports.makeVisitor = exports.makeMakeVisitor = exports.match = void 0;
const deepMatch = (a, b) => {
    if (a === b &&
        ["number", "string", "boolean", "bigint"].includes(typeof a) &&
        typeof a === typeof b) {
        return true;
    }
    if (a === null || b === null) {
        return a === b;
    }
    if (typeof a === "object" && typeof b === "object") {
        if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
            return a.every((a, i) => deepMatch(a, b[i]));
        }
        else {
            return Object.entries(b).every(([k, b]) => deepMatch(k in a ? a[k] : undefined, b));
        }
    }
    return false;
};
const match = (...args) => {
    const rec = (end) => ({
        end,
        otherwise: (handler) => handler(...args),
        on: (...match) => (handler) => rec(() => deepMatch(args, match)
            ? handler(...args)
            : end()),
    });
    return rec(() => {
        throw new Error("Not exhaustive");
    });
};
exports.match = match;
const errors_1 = require("../error/errors");
const makeMakeVisitor = (tag) => () => (handlers) => (input) => {
    const handler = handlers[input[tag]];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (handler) {
        return handler(input);
    }
    else {
        (0, errors_1.throwInternalCompilerError)(`Reached impossible case: ${input[tag]}`);
    }
};
exports.makeMakeVisitor = makeMakeVisitor;
/**
 * Make visitor for disjoint union (tagged union, discriminated union)
 */
exports.makeVisitor = (0, exports.makeMakeVisitor)("kind");
const singleton = (key, value) => {
    return { [key]: value };
};
exports.singleton = singleton;
exports.entries = Object.entries;
exports.keys = Object.keys;
