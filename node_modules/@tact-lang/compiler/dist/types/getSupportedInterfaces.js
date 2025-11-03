"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupportedInterfaces = getSupportedInterfaces;
const features_1 = require("../config/features");
function getSupportedInterfaces(type, ctx) {
    const interfaces = [];
    interfaces.push("org.ton.abi.ipfs.v0");
    interfaces.push("org.ton.deploy.lazy.v0");
    if ((0, features_1.enabledDebug)(ctx)) {
        interfaces.push("org.ton.debug.v0");
    }
    type.interfaces.forEach((iface) => interfaces.push(iface));
    return interfaces;
}
