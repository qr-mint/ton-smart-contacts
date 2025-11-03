"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topologicalSort = topologicalSort;
const errors_1 = require("../error/errors");
function topologicalSort(src, references) {
    const result = [];
    const visited = new Set();
    const visiting = new Set();
    const visit = (src) => {
        if (visiting.has(src)) {
            (0, errors_1.throwInternalCompilerError)("Cycle detected");
        }
        if (!visited.has(src)) {
            visiting.add(src);
            for (const r of references(src)) {
                visit(r);
            }
            visiting.delete(src);
            visited.add(src);
            result.push(src);
        }
    };
    for (const s of src) {
        visit(s);
    }
    return result;
}
