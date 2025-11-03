"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showCommit = showCommit;
exports.getVersion = getVersion;
const path_1 = require("path");
const child_process_1 = require("child_process");
const zod_1 = require("zod");
const promises_1 = require("fs/promises");
const rootPath = (0, path_1.join)(__dirname, "..", "..");
function showCommit() {
    // if working inside a git repository
    // also print the current git commit hash
    try {
        const gitCommit = (0, child_process_1.execFileSync)("git", [`--git-dir=${(0, path_1.join)(rootPath, ".git")}`, "rev-parse", "HEAD"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
            cwd: rootPath,
        }).trim();
        console.log(`git commit: ${gitCommit}`);
    }
    finally {
        process.exit(0);
    }
}
async function getVersion() {
    const packageSchema = zod_1.z.object({
        version: zod_1.z.string(),
    });
    const packageJsonPath = (0, path_1.join)(rootPath, "package.json");
    const pkg = packageSchema.parse(JSON.parse(await (0, promises_1.readFile)(packageJsonPath, "utf-8")));
    return pkg.version;
}
