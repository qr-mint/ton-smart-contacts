"use strict";
/**
 * Render error message to string for compiler CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayToString = void 0;
const errors_1 = require("./errors");
/**
 * @deprecated Use `Logger` from src/error/logger-util.ts
 */
exports.displayToString = {
    text: (text) => text,
    sub: (parts, ...subst) => {
        const [head, ...tail] = parts;
        if (!head) {
            return "";
        }
        return tail.reduce((acc, part, index) => {
            const sub = subst[index];
            return acc + sub + part;
        }, head);
    },
    link: (text, _loc) => text,
    at: (loc, body) => {
        return `${(0, errors_1.locationStr)(loc)}${body}\n${loc.interval.getLineAndColumnMessage()}`;
    },
};
