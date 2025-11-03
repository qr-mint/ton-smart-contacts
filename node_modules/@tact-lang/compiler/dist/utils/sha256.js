"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highest32ofSha256 = exports.sha256 = void 0;
const crypto_1 = require("@ton/crypto");
// Witness tag. Do not use, do not export!
const Sha256Tag = Symbol("sha256");
const sha256 = (input) => ({
    kind: Sha256Tag,
    value: bufferToBigInt((0, crypto_1.sha256_sync)(input)),
});
exports.sha256 = sha256;
/**
 * Extracts the most significant 32 bits from a `BigInt` value representing an SHA-256 hash.
 *
 * Example 1:
 * ```typescript
 * sha.value = BigInt(0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef)
 * ```
 * `sha256LoadUint32BE(sha)` will return `0x12345678`, as the top 32 bits are `0x12345678`.
 *
 *
 * Example 2:
 * ```typescript
 * sha.value = BigInt(0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba)
 * ````
 * `sha256LoadUint32BE(sha)` will return `0x98765432`, as the top 32 bits are `0x98765432`.
 */
const highest32ofSha256 = (sha) => sha.value >> (256n - 32n);
exports.highest32ofSha256 = highest32ofSha256;
const bufferToBigInt = (buffer) => buffer.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);
