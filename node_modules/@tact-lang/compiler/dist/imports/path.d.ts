declare const pathTag: unique symbol;
/**
 * Safe relative path
 */
export type RelativePath = {
    /**
     * Number of "../" in front of path
     */
    readonly stepsUp: number;
    /**
     * /-separated strings that go after optional ../
     */
    readonly segments: readonly string[];
    /**
     * Proof that path was created by RelativePath constructor
     */
    readonly [pathTag]: true;
};
/**
 * Convert raw string with relative POSIX path into RelativePath
 */
export declare const fromString: (raw: string) => RelativePath;
/**
 * Convert RelativePath to string.
 */
export declare const asString: ({ stepsUp, segments }: RelativePath) => string;
/**
 * Empty path, equivalent to "."
 */
export declare const emptyPath: RelativePath;
export {};
