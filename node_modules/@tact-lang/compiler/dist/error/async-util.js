"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thenUncolored = exports.catchUncolored = void 0;
/**
 * .catch(), but works both with sync and async functions
 */
const catchUncolored = (cb, onError) => {
    try {
        const result = cb();
        if (result instanceof Promise) {
            // eslint-disable-next-line @typescript-eslint/require-await
            return result.catch(async (e) => onError(e));
        }
        else {
            return result;
        }
    }
    catch (e) {
        return onError(e);
    }
};
exports.catchUncolored = catchUncolored;
/**
 * .then(), but works both with sync and async functions
 */
const thenUncolored = (t, f) => {
    if (t instanceof Promise) {
        // eslint-disable-next-line @typescript-eslint/require-await,  @typescript-eslint/no-explicit-any -- this is absolutely intended
        return t.then(async (t) => f(t));
    }
    else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return f(t);
    }
};
exports.thenUncolored = thenUncolored;
