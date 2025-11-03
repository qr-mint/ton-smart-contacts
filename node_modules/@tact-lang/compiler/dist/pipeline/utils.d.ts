import type { TypeDescription } from "../types/types";
/**
 * This function sorts contracts in topological order.
 * It also checks for cycles in the graph of dependencies and returns undefined if a cycle is found.
 * It works in O(N) time, where N is the number of contracts.
 * @param allContracts - list of all contracts.
 * @returns sorted list of contracts or undefined if a cycle is found
 */
export declare const topSortContracts: (allContracts: TypeDescription[]) => TypeDescription[] | undefined;
