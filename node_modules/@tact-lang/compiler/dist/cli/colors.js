"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnsiMarkup = exports.isColorSupported = void 0;
const os_1 = require("os");
const isColorSupported = () => {
    if (process.env.CI) {
        return true;
    }
    if (process.platform === "win32") {
        const [major, _, build] = (0, os_1.release)().split(".").map(Number);
        // Windows 10, Build 10586+
        return ((major && major > 10) || (major === 10 && build && build >= 10586));
    }
    if (process.stdout.isTTY && process.env.TERM !== "dumb") {
        return true;
    }
    return false;
};
exports.isColorSupported = isColorSupported;
const format = (code) => (s) => `\x1b[${code}m${s}\x1b[39m`;
const cond = (isEnabled) => (f) => (x) => isEnabled ? f(x) : x;
const getAnsiMarkup = (isEnabled, f = cond(isEnabled)) => ({
    reset: f((s) => `\x1b[0m${s}`),
    bold: f((s) => `\x1b[1m${s}\x1b[22m`),
    red: f(format(31)),
    green: f(format(32)),
    yellow: f(format(33)),
    blue: f(format(34)),
    magenta: f(format(35)),
    cyan: f(format(36)),
    white: f(format(37)),
    gray: f(format(90)),
});
exports.getAnsiMarkup = getAnsiMarkup;
