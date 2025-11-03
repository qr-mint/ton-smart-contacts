"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idToHex = idToHex;
const core_1 = require("@ton/core");
function idToHex(id) {
    return (0, core_1.beginCell)()
        .storeUint(id, 32)
        .endCell()
        .beginParse()
        .loadBuffer(4)
        .toString("hex");
}
