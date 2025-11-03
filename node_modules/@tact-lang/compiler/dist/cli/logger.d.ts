import type { Logger } from "../error/logger-util";
import type { AnsiMarkup } from "./colors";
import type * as path from "path";
export declare const CliLogger: () => {
    log: (message: string) => void;
    hadErrors: () => boolean;
};
export type Verbosity = "error" | "warn" | "info";
type PathApi = typeof path;
export declare const TerminalLogger: <T>(pathApi: PathApi, verbosity: Verbosity, ansi: AnsiMarkup, compile: (log: Logger<string, never>) => T) => T;
export {};
