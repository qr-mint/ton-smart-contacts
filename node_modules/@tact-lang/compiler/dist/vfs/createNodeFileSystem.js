"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNodeFileSystem = createNodeFileSystem;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function ensureInsideProjectRoot(filePath, root) {
    if (!filePath.startsWith(root)) {
        throw new Error(`Path "${filePath} is outside of the root directory "${root}"`);
    }
}
function ensureNotSymlink(filePath) {
    if (fs_1.default.lstatSync(filePath).isSymbolicLink()) {
        throw new Error(`Path "${filePath}" is a symbolic link which are not processed by Tact to forbid out-of-project-root accesses via symlinks`);
    }
}
function createNodeFileSystem(root, readonly = true) {
    let normalizedRoot = path_1.default.normalize(root);
    if (!normalizedRoot.endsWith(path_1.default.sep)) {
        normalizedRoot += path_1.default.sep;
    }
    return {
        root: normalizedRoot,
        exists(filePath) {
            ensureInsideProjectRoot(filePath, normalizedRoot);
            const result = fs_1.default.existsSync(filePath);
            if (result) {
                ensureNotSymlink(filePath);
            }
            return result;
        },
        resolve(...filePath) {
            return path_1.default.normalize(path_1.default.resolve(normalizedRoot, ...filePath));
        },
        readFile(filePath) {
            ensureInsideProjectRoot(filePath, normalizedRoot);
            ensureNotSymlink(filePath);
            return fs_1.default.readFileSync(filePath);
        },
        writeFile(filePath, content) {
            if (readonly) {
                throw new Error("File system is readonly");
            }
            ensureInsideProjectRoot(filePath, normalizedRoot);
            if (fs_1.default.existsSync(filePath)) {
                ensureNotSymlink(filePath);
            }
            fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
            fs_1.default.writeFileSync(filePath, content);
        },
    };
}
