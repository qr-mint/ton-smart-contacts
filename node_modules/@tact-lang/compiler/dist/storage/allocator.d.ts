import type { ABITypeRef } from "@ton/core";
import type { AllocationCell, AllocationOperation, AllocationOperationType } from "./operation";
export declare function getAllocationOperationFromField(src: ABITypeRef, structLoader: (name: string) => {
    bits: number;
    refs: number;
}): AllocationOperationType;
export declare function allocate(type: {
    reserved: {
        bits: number;
        refs: number;
    };
    ops: AllocationOperation[];
}): AllocationCell;
