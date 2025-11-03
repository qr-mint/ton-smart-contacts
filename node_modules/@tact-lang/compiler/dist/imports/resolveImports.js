"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveImports = resolveImports;
const errors_1 = require("../error/errors");
const resolveLibrary_1 = require("./resolveLibrary");
function resolveImports({ entrypoint, parser, project, stdlib, }) {
    const imported = {
        func: new Map(),
        tact: new Map(),
    };
    const processed = new Set();
    const pending = [];
    function processImports(sourceFrom) {
        const imp = parser.parseImports(sourceFrom);
        for (const { importPath, loc } of imp) {
            // Resolve library
            const resolved = (0, resolveLibrary_1.resolveLibrary)({
                sourceFrom,
                importPath,
                project: project,
                stdlib: stdlib,
            });
            if (!resolved.ok) {
                (0, errors_1.throwCompilationError)(`Could not resolve import in ${sourceFrom.path}`, loc);
            }
            // Check if already imported
            if (imported[resolved.language].has(resolved.path)) {
                continue;
            }
            // Load code
            const vfs = resolved.origin === "user" ? project : stdlib;
            if (!vfs.exists(resolved.path)) {
                (0, errors_1.throwCompilationError)(`Could not find source file ${resolved.path}`);
            }
            const code = vfs.readFile(resolved.path).toString();
            // Add to imports
            if (resolved.language === "func") {
                imported.func.set(resolved.path, {
                    code,
                    path: resolved.path,
                    origin: resolved.origin,
                });
            }
            else {
                if (!processed.has(resolved.path)) {
                    processed.add(resolved.path);
                    pending.push({
                        path: resolved.path,
                        code,
                        origin: resolved.origin,
                    });
                }
            }
        }
    }
    const stdlibTactPath = stdlib.resolve("std/stdlib.tact");
    if (!stdlib.exists(stdlibTactPath)) {
        (0, errors_1.throwCompilationError)(`Could not find stdlib.tact at ${stdlibTactPath}`);
    }
    const stdlibSource = {
        code: stdlib.readFile(stdlibTactPath).toString(),
        path: stdlibTactPath,
        origin: "stdlib",
    };
    imported.tact.set(stdlibTactPath, stdlibSource);
    processImports(stdlibSource);
    const codePath = project.resolve(entrypoint);
    if (!project.exists(codePath)) {
        (0, errors_1.throwCompilationError)(`Could not find entrypoint ${entrypoint}`);
    }
    const entrySource = {
        code: project.readFile(codePath).toString(),
        path: codePath,
        origin: "user",
    };
    processImports(entrySource);
    while (pending.length > 0) {
        const p = pending.shift();
        imported.tact.set(p.path, p);
        processImports(p);
    }
    imported.tact.set(codePath, entrySource);
    return {
        tact: [...imported.tact.values()],
        func: [...imported.func.values()],
    };
}
