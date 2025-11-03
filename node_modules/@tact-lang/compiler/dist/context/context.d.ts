type Key = string | number;
export type Store<T> = Map<Key, T>;
type Stores = Map<symbol, Store<any> | undefined>;
export declare class CompilerContext {
    readonly stores: Stores;
    constructor(args?: {
        stores: Stores;
    });
    updateStore: <T>(storeDispatch: symbol, key: Key, value: T) => CompilerContext;
}
export declare function createContextStore<T>(): {
    get(ctx: CompilerContext, key: Key): T | null;
    all(ctx: CompilerContext): Store<T>;
    set(ctx: CompilerContext, key: Key, v: T): CompilerContext;
};
export {};
