export declare const zip: <T, U>(arr1: T[], arr2: U[]) => [T, U][];
export declare const repeat: <T>(value: T, count: number) => readonly T[];
export declare const isUndefined: <T>(t: T | undefined) => t is undefined;
export declare const groupBy: <T, U>(items: readonly T[], f: (t: T) => U) => readonly (readonly T[])[];
export declare const intercalate: <T>(items: readonly (readonly T[])[], value: T) => readonly T[];
