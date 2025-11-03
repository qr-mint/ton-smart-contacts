/**
 * .catch(), but works both with sync and async functions
 */
export declare const catchUncolored: <T>(cb: () => T, onError: (e: unknown) => T) => T;
/**
 * .then(), but works both with sync and async functions
 */
export declare const thenUncolored: <T, U>(t: T, f: (t: T) => U) => T extends Promise<any> ? Promise<U> : U;
