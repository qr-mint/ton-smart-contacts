"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__DANGER__disableVersionNumber = __DANGER__disableVersionNumber;
exports.getCompilerVersion = getCompilerVersion;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const version = require("../../package.json").version;
let __DANGER__VersionNumberDisabled = false;
function __DANGER__disableVersionNumber() {
    __DANGER__VersionNumberDisabled = true;
}
function getCompilerVersion() {
    if (__DANGER__VersionNumberDisabled) {
        return "invalid";
    }
    return version;
}
