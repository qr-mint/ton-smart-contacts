import type { CompilerContext } from "../context/context";
import type { ContractABI } from "@ton/core";
import type { ContractsCodes } from "./writers/writeContract";
export declare function writeProgram(ctx: CompilerContext, abiSrc: ContractABI, basename: string, contractCodes: ContractsCodes, debug: boolean): Promise<{
    entrypoint: string;
    files: {
        name: string;
        code: string;
    }[];
    constants: {
        name: string;
        value: string | undefined;
        fromContract: boolean;
    }[];
    abi: string;
}>;
