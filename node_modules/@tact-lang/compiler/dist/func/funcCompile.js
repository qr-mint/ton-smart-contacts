"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.funcCompile = funcCompile;
// Wasm Imports
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CompilerModule = require("./funcfiftlib.js");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FuncFiftLibWasm = require("./funcfiftlib.wasm.js").FuncFiftLibWasm;
const WasmBinary = Buffer.from(FuncFiftLibWasm, "base64");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const writeToCString = (mod, data) => {
    const len = mod.lengthBytesUTF8(data) + 1;
    const ptr = mod._malloc(len);
    mod.stringToUTF8(data, ptr, len);
    return ptr;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const writeToCStringPtr = (mod, str, ptr) => {
    const allocated = writeToCString(mod, str);
    mod.setValue(ptr, allocated, "*");
    return allocated;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const readFromCString = (mod, pointer) => mod.UTF8ToString(pointer);
function cutFirstLine(src) {
    return src.slice(src.indexOf("\n") + 1);
}
async function funcCompile(args) {
    // Parameters
    const files = args.entries;
    const configStr = JSON.stringify({
        sources: files,
        optLevel: 2, // compileConfig.optLevel || 2
    });
    // Pointer tracking
    const allocatedPointers = [];
    const allocatedFunctions = [];
    const trackPointer = (pointer) => {
        allocatedPointers.push(pointer);
        return pointer;
    };
    const trackFunctionPointer = (pointer) => {
        allocatedFunctions.push(pointer);
        return pointer;
    };
    // Create module
    const logs = [];
    const mod = await CompilerModule({
        wasmBinary: WasmBinary,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        printErr: (e) => {
            logs.push(e);
        },
    });
    // Execute
    try {
        // Write config
        const configPointer = trackPointer(writeToCString(mod, configStr));
        // FS emulation callback
        const callbackPtr = trackFunctionPointer(mod.addFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (_kind, _data, contents, error) => {
            const kind = readFromCString(mod, _kind);
            const data = readFromCString(mod, _data);
            if (kind === "realpath") {
                allocatedPointers.push(writeToCStringPtr(mod, data, contents));
            }
            else if (kind === "source") {
                try {
                    const fl = args.sources.find((v) => v.path === data);
                    if (!fl) {
                        throw Error("File not found: " + data);
                    }
                    allocatedPointers.push(writeToCStringPtr(mod, fl.content, contents));
                }
                catch (err) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const e = err;
                    allocatedPointers.push(writeToCStringPtr(mod, "message" in e ? e.message : e.toString(), error));
                }
            }
            else {
                allocatedPointers.push(writeToCStringPtr(mod, "Unknown callback kind " + kind, error));
            }
        }, "viiii"));
        // Execute
        const resultPointer = trackPointer(mod._func_compile(configPointer, callbackPtr));
        const retJson = readFromCString(mod, resultPointer);
        const result = JSON.parse(retJson);
        const msg = logs.join("\n");
        switch (result.status) {
            case "error": {
                return {
                    ok: false,
                    log: logs.length > 0
                        ? msg
                        : result.message
                            ? result.message
                            : "Unknown error",
                    fift: null,
                    output: null,
                };
            }
            case "ok": {
                return {
                    ok: true,
                    log: logs.length > 0
                        ? msg
                        : result.warnings
                            ? result.warnings
                            : "",
                    fift: cutFirstLine(result.fiftCode.replaceAll("\\n", "\n")),
                    output: Buffer.from(result.codeBoc, "base64"),
                };
            }
        }
    }
    catch (e) {
        args.logger.error(e);
        throw Error("Unexpected compiler response");
    }
    finally {
        for (const i of allocatedFunctions) {
            mod.removeFunction(i);
        }
        for (const i of allocatedPointers) {
            mod._free(i);
        }
    }
    throw Error("Unexpected compiler response");
}
