import type { CompilerContext } from "../context/context";
type Flag = "inline" | "impure" | "inline_ref";
type Body = {
    kind: "generic";
    code: string;
} | {
    kind: "asm";
    shuffle: string;
    code: string;
    singleLine: boolean;
} | {
    kind: "skip";
};
export type WrittenFunction = {
    name: string;
    code: Body;
    signature: string;
    flags: Set<Flag>;
    depends: Set<string>;
    comment: string | null;
    context: string | null;
};
export declare class WriterContext {
    #private;
    readonly ctx: CompilerContext;
    constructor(ctx: CompilerContext, name: string);
    get name(): string;
    clone(): WriterContext;
    extract(debug?: boolean): WrittenFunction[];
    skip(name: string): void;
    fun(name: string, handler: () => void): void;
    asm(shuffle: string, code: string, singleLine?: boolean): void;
    body(handler: () => void): void;
    main(handler: () => void): void;
    signature(sig: string): void;
    flag(flag: Flag): void;
    used(name: string): string;
    comment(src: string): void;
    context(src: string): void;
    currentContext(): string | null;
    inIndent: (handler: () => void) => void;
    inBlock: (beforeCurlyBrace: string, handler: () => void) => void;
    append(src?: string): void;
    write(src?: string): void;
    isRendered(key: string): boolean;
    markRendered(key: string): void;
}
export {};
