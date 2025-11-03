import type { Config } from "../../config/parseConfig";
import type { GetParserResult } from "../arg-parser";
import { ArgParser } from "../arg-parser";
import { ArgConsumer } from "../arg-consumer";
import type { VirtualFileSystem } from "../../vfs/VirtualFileSystem";
import { Logger } from "../../context/logger";
import type { TactErrorCollection } from "../../error/errors";
export type Args = ArgConsumer<GetParserResult<ReturnType<typeof ArgSchema>>>;
export declare const main: () => Promise<void>;
declare const ArgSchema: (Parser: ArgParser) => (argv: string[]) => {
    kind: "fail";
} | {
    kind: "error";
    rest: string[];
} | {
    kind: "ok";
    value: {
        config?: string[] | undefined;
        project?: string[] | undefined;
        quiet?: true[] | undefined;
        "with-decompilation"?: true[] | undefined;
        func?: true[] | undefined;
        check?: true[] | undefined;
        eval?: string[] | undefined;
        version?: true[] | undefined;
        help?: true[] | undefined;
        output?: string[] | undefined;
        watch?: true[] | undefined;
        immediate?: string[] | undefined;
    };
    rest: string[];
};
export declare const createSingleFileConfig: (fileName: string, outputDir: string) => {
    readonly projects: readonly [{
        readonly name: string;
        readonly path: string;
        readonly output: string;
        readonly options: {
            readonly debug: true;
            readonly external: true;
            readonly ipfsAbiGetter: false;
            readonly interfacesGetter: false;
            readonly safety: {
                readonly nullChecks: true;
            };
        };
        readonly mode: "full";
    }];
};
export declare function run(args: {
    logger: Logger;
    config: Config;
    project: VirtualFileSystem;
    stdlib: VirtualFileSystem;
}): Promise<{
    ok: boolean;
    error: TactErrorCollection[];
}>;
export {};
