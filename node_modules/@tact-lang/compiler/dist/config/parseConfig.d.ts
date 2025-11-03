import type { Config } from "./config";
export * from "./config";
export * from "./config.zod";
/**
 * Takes a stringified JSON [src] of a schema, converts to JSON and returns a parsed schema if it's valid
 *
 * @throws If the provided JSON string isn't a valid JSON
 * @throws If the provided JSON string isn't valid according to the config schema
 */
export declare function parseConfig(src: string): Config;
/**
 * Takes a config schema object and verifies that it's valid
 *
 * @throws If the provided object isn't valid according to the config schema
 */
export declare function verifyConfig(config: Config): Config;
