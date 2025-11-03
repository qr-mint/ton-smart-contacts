import type { Unwrap } from "../utils/tricks";
type Token<K, V> = Parser<[K, V]>;
type Parser<T> = (argv: Argv) => Match<T>;
type Match<T> = MatchOk<T> | MatchFail | MatchError;
type MatchOk<T> = {
    kind: "ok";
    value: T;
    rest: Argv;
};
type MatchFail = {
    kind: "fail";
};
type MatchError = {
    kind: "error";
    rest: Argv;
};
type Argv = string[];
type NotIn<K, T> = [K] extends [keyof T] ? never : K;
type TokenMap<T> = {
    [K in keyof T]?: T[K][];
};
type TokensPublic<T> = {
    add: <K extends string, V>(token: Token<NotIn<K, T>, V>) => TokensPrivate<T & Record<K, V>>;
    end: Parser<Unwrap<TokenMap<T>>>;
};
type TokensPrivate<T> = TokensNext<T> & TokensPublic<T>;
type TokensNext<T> = {
    next: Parser<(obj: TokenMap<T>) => void>;
};
export type ArgParser = ReturnType<typeof ArgParser>;
export type GetParserResult<T> = [T] extends [
    (...args: never[]) => Match<TokenMap<infer U>>
] ? U : never;
type ArgParserErrors = {
    argumentHasParameter: (param: string, argName: string) => void;
    unexpectedArgument: (text: string | undefined) => void;
};
export declare const ArgParser: (Errors: ArgParserErrors) => {
    immediate: Token<"immediate", string>;
    boolean: <K extends string>(longName: K, shortName: string | undefined) => Token<K, true>;
    string: <K extends string>(longName: K, shortName: string | undefined, argName: string) => Token<K, string>;
    tokenizer: TokensPrivate<object>;
};
export {};
