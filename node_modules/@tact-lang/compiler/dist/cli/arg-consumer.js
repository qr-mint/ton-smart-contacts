"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgConsumer = void 0;
const ArgConsumer = (Errors, args) => {
    const copy = { ...args };
    const leftover = () => Object.keys(copy);
    const single = (k) => {
        const s = copy[k] ?? [];
        if (s.length > 1) {
            Errors.duplicateArgument(k);
            return s[0];
        }
        if (s.length === 0) {
            return undefined;
        }
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete copy[k];
        return s[0];
    };
    const multiple = (k) => {
        const s = copy[k] ?? [];
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete copy[k];
        return s;
    };
    return {
        leftover,
        // TS bug
        single: single,
        multiple: multiple,
    };
};
exports.ArgConsumer = ArgConsumer;
