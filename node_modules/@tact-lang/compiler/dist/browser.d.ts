import type { Config } from "./config/parseConfig";
import type { ILogger } from "./context/logger";
export declare function run(args: {
    config: Config;
    files: Record<string, string>;
    logger?: ILogger;
}): Promise<{
    ok: boolean;
    error: Error[];
}>;
