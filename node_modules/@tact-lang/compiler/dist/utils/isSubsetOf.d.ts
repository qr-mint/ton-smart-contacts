/** Taken from TypeScript collection lib to perfectly match the .isSubsetOf signature */
export interface ReadonlySetLike<T> {
    /**
     * Despite its name, returns an iterator of the values in the set-like.
     */
    keys(): Iterator<T>;
    /**
     * @returns a boolean indicating whether an element with the specified value exists in the set-like or not.
     */
    has(value: T): boolean;
    /**
     * @returns the number of (unique) elements in the set-like.
     */
    readonly size: number;
}
/**
 * @returns a boolean indicating whether all the elements in Set `one` are also in the `other`.
 */
export declare function isSubsetOf<T>(one: Set<T>, other: ReadonlySetLike<unknown>): boolean;
