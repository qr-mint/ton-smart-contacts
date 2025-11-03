"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeString = writeString;
exports.writeAddress = writeAddress;
exports.writeCell = writeCell;
exports.writeSlice = writeSlice;
const core_1 = require("@ton/core");
function writeString(str, ctx) {
    const cell = (0, core_1.beginCell)().storeStringTail(str).endCell();
    return writeRawSlice("string", `String "${str}"`, cell, ctx);
}
function writeAddress(address, ctx) {
    return writeRawSlice("address", address.toString(), (0, core_1.beginCell)().storeAddress(address).endCell(), ctx);
}
function writeCell(cell, ctx) {
    return writeRawCell("cell", "Cell " + cell.hash().toString("base64"), cell, ctx);
}
function writeSlice(slice, ctx) {
    const cell = slice.asCell();
    return writeRawSlice("slice", "Slice " + cell.hash().toString("base64"), cell, ctx);
}
function writeRawSlice(prefix, comment, cell, ctx) {
    const h = cell.hash().toString("hex");
    const t = cell.toBoc({ idx: false }).toString("hex");
    const k = "slice:" + prefix + ":" + h;
    if (ctx.isRendered(k)) {
        return `__gen_slice_${prefix}_${h}`;
    }
    ctx.markRendered(k);
    ctx.fun(`__gen_slice_${prefix}_${h}`, () => {
        ctx.signature(`slice __gen_slice_${prefix}_${h}()`);
        ctx.comment(comment);
        ctx.context("constants");
        ctx.asm("", `B{${t}} B>boc <s PUSHSLICE`);
    });
    return `__gen_slice_${prefix}_${h}`;
}
function writeRawCell(prefix, comment, cell, ctx) {
    const h = cell.hash().toString("hex");
    const t = cell.toBoc({ idx: false }).toString("hex");
    const k = "cell:" + prefix + ":" + h;
    if (ctx.isRendered(k)) {
        return `__gen_cell_${prefix}_${h}`;
    }
    ctx.markRendered(k);
    ctx.fun(`__gen_cell_${prefix}_${h}`, () => {
        ctx.signature(`cell __gen_cell_${prefix}_${h}()`);
        ctx.comment(comment);
        ctx.context("constants");
        ctx.asm("", `B{${t}} B>boc PUSHREF`);
    });
    return `__gen_cell_${prefix}_${h}`;
}
