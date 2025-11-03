type Extend<T extends any[], H> = H extends infer A ? [...T, A] : never;
type Flat<TS extends any[], R extends any[] = []> = TS extends [
    infer H,
    ...infer T
] ? Flat<T, Extend<R, H>> : R;
declare const NoSuchCase: unique symbol;
interface NoSuchCaseBug<L> extends Array<never> {
    [NoSuchCase]: L;
}
type On<I extends any[], O> = {
    on: <const DI extends any[]>(...key: I extends Flat<DI> ? DI : NoSuchCaseBug<DI>) => <const DO>(handler: (...args: Extract<I, Flat<DI>>) => DO) => MV<Exclude<I, Flat<DI>>, O | DO>;
};
declare const CasesAreNotExhaustive: unique symbol;
interface NonExhaustiveBug<L> {
    [CasesAreNotExhaustive]: L;
}
type End<I extends any[], O> = [I] extends [never] ? EndInternal<I, O> : {
    otherwise: <const DO>(handle: (...input: I) => DO) => O | DO;
    end: NonExhaustiveBug<I>;
};
type MV<I extends any[], O> = End<I, O> & On<I, O>;
type EndInternal<I extends any[], O> = {
    otherwise: <const DO>(handle: (...input: I) => DO) => O | DO;
    end: () => O;
};
export declare const match: <const I extends any[]>(...args: I) => MV<Flat<I>, never>;
/**
 * Convert union to intersection. See https://stackoverflow.com/q/50374908
 */
export type Intersect<T> = (T extends unknown ? (x: T) => 0 : never) extends (x: infer R) => 0 ? R : never;
/**
 * Makes types more readable
 * Example: Unwrap<{ a: 1 } & { b: 2 }> = { a: 1, b: 2 }
 */
export type Unwrap<T> = T extends infer R ? {
    [K in keyof R]: R[K];
} : never;
type Inputs<I, T extends string> = I extends {
    [Z in T]: infer K;
} ? K extends string ? Record<K, (input: I) => unknown> : never : never;
type Outputs<O> = {
    [K in keyof O]: (input: never) => O[K];
};
type Handlers<I, O, T extends string> = Unwrap<Intersect<Inputs<I, T>>> & Outputs<O>;
export declare const makeMakeVisitor: <T extends string>(tag: T) => <I>() => <O>(handlers: Handlers<I, O, T>) => (input: Extract<I, { [K in T]: string; }>) => O[keyof O];
/**
 * Make visitor for disjoint union (tagged union, discriminated union)
 */
export declare const makeVisitor: <I>() => <O>(handlers: Handlers<I, O, "kind">) => (input: Extract<I, {
    kind: string;
}>) => O[keyof O];
export declare const singleton: <K extends string | symbol, V>(key: K, value: V) => Record<K, V>;
export declare const entries: <O>(o: O) => { [K in keyof O]: [K, O[K]]; }[keyof O][];
export declare const keys: <O>(o: O) => (keyof O)[];
export {};
