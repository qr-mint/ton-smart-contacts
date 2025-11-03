"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLibrary = resolveLibrary;
const path_1 = require("./path");
function resolveLibrary({ importPath, sourceFrom, project, stdlib, }) {
    if (importPath.type === "stdlib") {
        const tactFile = stdlib.resolve("libs", (0, path_1.asString)(importPath.path));
        if (stdlib.exists(tactFile)) {
            return {
                ok: true,
                path: tactFile,
                origin: "stdlib",
                language: "tact",
            };
        }
        else {
            return { ok: false };
        }
    }
    else {
        const vfs = sourceFrom.origin === "stdlib" ? stdlib : project;
        const resolvedPath = vfs.resolve(sourceFrom.path.slice(vfs.root.length), "..", (0, path_1.asString)(importPath.path));
        if (vfs.exists(resolvedPath)) {
            return {
                ok: true,
                path: resolvedPath,
                origin: sourceFrom.origin,
                language: importPath.language,
            };
        }
        else {
            return { ok: false };
        }
    }
}
