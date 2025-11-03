"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSubsetOf = isSubsetOf;
/**
 * @returns a boolean indicating whether all the elements in Set `one` are also in the `other`.
 */
function isSubsetOf(one, other) {
    // If the builtin method exists, just call it
    if ("isSubsetOf" in Set.prototype) {
        return one.isSubsetOf(other);
    }
    // If not, provide the implementation
    if (one.size > other.size) {
        return false;
    }
    for (const element of one) {
        if (!other.has(element)) {
            return false;
        }
    }
    return true;
}
