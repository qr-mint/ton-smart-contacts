import fc from "fast-check";
import type * as A from "./ast";
export declare function randomAstExpression(maxDepth: number): fc.Arbitrary<A.AstExpression>;
export declare function diffAstObjects(left: A.AstExpression, right: A.AstExpression, prettyBefore: string, prettyAfter: string): void;
