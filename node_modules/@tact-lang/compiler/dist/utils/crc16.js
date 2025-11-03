"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crc16 = crc16;
/**
 * Generates the CRC16 lookup table for the given polynomial.
 * (Using polynomial 0x1021)
 */
function makeCRC16Table(polynomial) {
    const table = new Uint16Array(256);
    for (let n = 0; n < 256; n++) {
        // Initialize crc for this byte. (Note the left shift by 8)
        let crc = n << 8;
        for (let k = 0; k < 8; k++) {
            crc = (crc & 0x8000 ? (crc << 1) ^ polynomial : crc << 1) & 0xffff;
        }
        table[n] = crc;
    }
    return table;
}
// Precompute the CRC-16-CCITT (XMODEM) table once at module load.
const CRC16_TABLE = makeCRC16Table(0x1021);
/**
 * Computes the CRC16 checksum of the given data.
 *
 * @param data - A string or Uint8Array to compute the checksum for.
 * @returns The computed CRC16 checksum.
 */
function crc16(data) {
    if (typeof data === "string") {
        data = new TextEncoder().encode(data);
    }
    let crc = 0;
    for (const byte of data) {
        crc = ((crc << 8) ^ CRC16_TABLE[((crc >> 8) ^ byte) & 0xff]) & 0xffff;
    }
    return crc;
}
