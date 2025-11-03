"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfig = parseConfig;
exports.verifyConfig = verifyConfig;
const config_zod_1 = require("./config.zod");
__exportStar(require("./config"), exports);
__exportStar(require("./config.zod"), exports);
/**
 * Takes a stringified JSON [src] of a schema, converts to JSON and returns a parsed schema if it's valid
 *
 * @throws If the provided JSON string isn't a valid JSON
 * @throws If the provided JSON string isn't valid according to the config schema
 */
function parseConfig(src) {
    const parsed = JSON.parse(src);
    return config_zod_1.configSchema.parse(parsed);
}
/**
 * Takes a config schema object and verifies that it's valid
 *
 * @throws If the provided object isn't valid according to the config schema
 */
function verifyConfig(config) {
    return config_zod_1.configSchema.parse(config);
}
