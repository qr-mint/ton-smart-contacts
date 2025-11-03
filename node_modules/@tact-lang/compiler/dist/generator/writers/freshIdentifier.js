"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freshIdentifier = freshIdentifier;
const id_1 = require("./id");
let counter = 0;
function freshIdentifier(prefix) {
    const fresh = `fresh$${prefix}_${counter}`;
    counter += 1;
    return (0, id_1.funcIdOf)(fresh);
}
