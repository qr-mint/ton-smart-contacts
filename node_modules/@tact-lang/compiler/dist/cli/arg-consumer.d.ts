import type { Intersect } from "../utils/tricks";
type ArgConsumerErrors = {
    duplicateArgument: (name: string) => void;
};
export declare const ArgConsumer: <T>(Errors: ArgConsumerErrors, args: { [L in keyof T]?: T[L][]; }) => {
    leftover: () => string[];
    single: Intersect<{ [K in keyof T]: (k: K) => T[K] | undefined; }[keyof T]>;
    multiple: Intersect<{ [K in keyof T]: (k: K) => T[K][] | undefined; }[keyof T]>;
};
export type ArgConsumer<T> = ReturnType<typeof ArgConsumer<T>>;
export {};
