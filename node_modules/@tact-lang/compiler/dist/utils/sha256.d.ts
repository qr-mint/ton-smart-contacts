declare const Sha256Tag: unique symbol;
type Sha256 = {
    readonly kind: typeof Sha256Tag;
    readonly value: bigint;
};
export declare const sha256: (input: Buffer | string) => Sha256;
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
export declare const highest32ofSha256: (sha: Sha256) => bigint;
export {};
