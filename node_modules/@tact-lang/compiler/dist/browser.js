"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const parseConfig_1 = require("./config/parseConfig");
const build_1 = require("./pipeline/build");
const createVirtualFileSystem_1 = require("./vfs/createVirtualFileSystem");
async function run(args) {
    // Verify config
    const config = (0, parseConfig_1.verifyConfig)(args.config);
    // Create project's writable fs
    const project = (0, createVirtualFileSystem_1.createVirtualFileSystem)("/", args.files, false);
    // Create stdlib path
    const stdlib = "@stdlib";
    // Compile
    let success = true;
    let errorCollection = [];
    for (const p of config.projects) {
        const built = await (0, build_1.build)({
            config: p,
            project,
            stdlib,
            logger: args.logger,
        });
        success = success && built.ok;
        if (!built.ok) {
            errorCollection = { ...errorCollection, ...built.error };
        }
    }
    return { ok: success, error: errorCollection };
}
