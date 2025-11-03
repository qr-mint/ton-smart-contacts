import type { CompilerContext } from "../context/context";
export type Effect = "contractStorageRead" | "contractStorageWrite";
export declare function computeReceiversEffects(ctx: CompilerContext): void;
