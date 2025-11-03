import type { AstNode } from "./ast";
/**
 * Recursively iterates over each node in an AstNode and applies a callback to each AST element.
 * @public
 * @param node The node to traverse.
 * @param callback The callback function to apply to each AST element.
 */
export declare function traverse(node: AstNode, callback: (node: AstNode) => void): void;
/**
 * Recursively iterates over each node in an AstNode and applies a callback to each AST element.
 * @public
 * @param node The node to traverse.
 * @param callback The callback function to apply to each AST element, if returns false, does not traverse child nodes
 */
export declare function traverseAndCheck(node: AstNode, callback: (node: AstNode) => boolean): void;
