import { z } from "zod";
import type * as C from "./config";
export declare const safetyOptionsSchema: z.ZodType<C.SafetyOptions>;
export declare const optimizationOptionsSchema: z.ZodType<C.OptimizationOptions>;
/**
 * Per-project configuration options
 *
 * Read more: https://docs.tact-lang.org/book/config#projects
 */
export declare const optionsSchema: z.ZodType<C.Options>;
export declare const modeSchema: z.ZodType<C.Mode>;
/**
 * Per-project configuration options
 *
 * Read more: https://docs.tact-lang.org/book/config#projects
 */
export declare const projectSchema: z.ZodType<C.Project>;
/**
 * Compiler configuration schema
 *
 * Read more: https://docs.tact-lang.org/book/config
 */
export declare const configSchema: z.ZodType<C.Config>;
