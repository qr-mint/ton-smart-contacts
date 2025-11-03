import type { VirtualFileSystem } from "../../vfs/VirtualFileSystem";
import type { Config } from "../../config/parseConfig";
import type { CliErrors } from "./error-schema";
import type { Args } from "./index";
export declare const watchAndCompile: (Args: Args, Errors: CliErrors, Fs: VirtualFileSystem, config: Config, watchPath: string, compile: (Args: Args, Errors: CliErrors, Fs: VirtualFileSystem, config: Config, signal?: AbortSignal) => Promise<void>) => Promise<void>;
