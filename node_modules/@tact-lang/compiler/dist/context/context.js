"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerContext = void 0;
exports.createContextStore = createContextStore;
class CompilerContext {
    stores = new Map();
    constructor(args = {
        stores: new Map(),
    }) {
        this.stores = args.stores;
        Object.freeze(this.stores);
        Object.freeze(this);
    }
    updateStore = (storeDispatch, key, value) => {
        const store = new Map(this.stores.get(storeDispatch) ?? []);
        store.set(key, value);
        const updatedStores = new Map(this.stores);
        updatedStores.set(storeDispatch, store);
        return new CompilerContext({ stores: updatedStores });
    };
}
exports.CompilerContext = CompilerContext;
function createContextStore() {
    const symbol = Symbol();
    return {
        get(ctx, key) {
            return ctx.stores.get(symbol)?.get(key) ?? null;
        },
        all(ctx) {
            return ctx.stores.get(symbol) ?? new Map();
        },
        set(ctx, key, v) {
            return ctx.updateStore(symbol, key, v);
        },
    };
}
