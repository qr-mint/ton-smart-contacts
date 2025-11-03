"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topSortContracts = void 0;
/**
 * This function sorts contracts in topological order.
 * It also checks for cycles in the graph of dependencies and returns undefined if a cycle is found.
 * It works in O(N) time, where N is the number of contracts.
 * @param allContracts - list of all contracts.
 * @returns sorted list of contracts or undefined if a cycle is found
 */
const topSortContracts = (allContracts) => {
    const visitingNow = new Set();
    const visited = new Set();
    const result = [];
    const dfs = (contract) => {
        visitingNow.add(contract);
        for (const c of contract.dependsOn) {
            if (c.kind !== "contract") {
                // This check should also be false. As contracts should be filtered out before calling this function.
                continue;
            }
            if (visitingNow.has(c)) {
                return false;
            }
            if (!visited.has(c)) {
                if (!dfs(c)) {
                    return false;
                }
            }
        }
        visitingNow.delete(contract);
        visited.add(contract);
        result.push(contract);
        return true;
    };
    for (const contract of allContracts) {
        if (!visited.has(contract)) {
            if (!dfs(contract)) {
                return undefined;
            }
        }
    }
    return result;
};
exports.topSortContracts = topSortContracts;
