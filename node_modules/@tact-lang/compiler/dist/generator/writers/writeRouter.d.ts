import type { FallbackReceiverSelector, ReceiverDescription, TypeDescription } from "../../types/types";
import type { WriterContext } from "../Writer";
import type { AstReceiver } from "../../ast/ast";
import type { SrcInfo } from "../../grammar";
import type { Effect } from "../../types/effects";
type ContractReceivers = {
    readonly internal: Receivers;
    readonly external: Receivers;
    readonly bounced: BouncedReceivers;
};
type Receivers = {
    kind: "internal" | "external";
    empty: ReceiverDescription | undefined;
    binary: ReceiverDescription[];
    comment: ReceiverDescription[];
    commentFallback: FallbackReceiver | undefined;
    fallback: FallbackReceiver | undefined;
};
type FallbackReceiver = {
    selector: FallbackReceiverSelector;
    effects: ReadonlySet<Effect>;
    ast: AstReceiver;
};
type BouncedReceivers = {
    binary: ReceiverDescription[];
    fallback: FallbackReceiver | undefined;
};
export declare function writeNonBouncedRouter(receivers: Receivers, contract: TypeDescription, wCtx: WriterContext): void;
export declare function groupContractReceivers(contract: TypeDescription): ContractReceivers;
export declare function writeBouncedRouter(bouncedReceivers: BouncedReceivers, contract: TypeDescription, wCtx: WriterContext): void;
export declare function commentPseudoOpcode(comment: string, includeZeroOpcode: boolean, loc: SrcInfo): string;
export {};
