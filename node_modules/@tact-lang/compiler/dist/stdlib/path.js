"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stdlibPath = void 0;
const path_1 = __importDefault(require("path"));
const filePath_1 = require("../utils/filePath");
exports.stdlibPath = (0, filePath_1.posixNormalize)(path_1.default.join(__dirname, "stdlib"));
