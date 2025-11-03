"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageCode = packageCode;
const fileFormat_1 = require("./fileFormat");
function packageCode(pkg) {
    const parsed = fileFormat_1.fileFormat.parse(pkg);
    return JSON.stringify(parsed);
}
