"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intercalate = exports.groupBy = exports.isUndefined = exports.repeat = exports.zip = void 0;
const zip = (arr1, arr2) => {
    const length = Math.min(arr1.length, arr2.length);
    return arr1.slice(0, length).flatMap((item1, index) => {
        const item2 = arr2[index];
        return item2 !== undefined ? [[item1, item2]] : [];
    });
};
exports.zip = zip;
const range = (from, to) => {
    return new Array(to - from + 1).fill(0).map((_, i) => from + i);
};
const repeat = (value, count) => {
    return range(1, count).map(() => value);
};
exports.repeat = repeat;
const isUndefined = (t) => typeof t === "undefined";
exports.isUndefined = isUndefined;
const groupBy = (items, f) => {
    const result = [];
    const [head, ...tail] = items;
    if ((0, exports.isUndefined)(head)) {
        return result;
    }
    let group = [head];
    result.push(group);
    let tag = f(head);
    for (const item of tail) {
        const nextTag = f(item);
        if (tag === nextTag) {
            group.push(item);
        }
        else {
            group = [item];
            result.push(group);
            tag = nextTag;
        }
    }
    return result;
};
exports.groupBy = groupBy;
const intercalate = (items, value) => {
    const [head, ...tail] = items;
    if ((0, exports.isUndefined)(head)) {
        return [];
    }
    const result = [...head];
    for (const item of tail) {
        result.push(value, ...item);
    }
    return result;
};
exports.intercalate = intercalate;
