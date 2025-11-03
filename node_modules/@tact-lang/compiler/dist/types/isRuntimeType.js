"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRuntimeType = isRuntimeType;
function isRuntimeType(src) {
    if (src.kind === "null") {
        return true;
    }
    if (src.kind === "ref_bounced") {
        return true;
    }
    return false;
}
