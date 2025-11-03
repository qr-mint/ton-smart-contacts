"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPadded = createPadded;
const text_1 = require("../../utils/text");
function createPadded(src) {
    return (0, text_1.trimIndent)(src)
        .split("\n")
        .map((v) => " ".repeat(4) + v)
        .join("\n");
}
