import type { ILogger } from "../context/logger";
export type FuncCompilationResult = {
    ok: false;
    log: string;
    fift: string | null;
    output: Buffer | null;
} | {
    ok: true;
    log: string;
    fift: string;
    output: Buffer;
};
export declare function funcCompile(args: {
    entries: string[];
    sources: {
        path: string;
        content: string;
    }[];
    logger: ILogger;
}): Promise<FuncCompilationResult>;
