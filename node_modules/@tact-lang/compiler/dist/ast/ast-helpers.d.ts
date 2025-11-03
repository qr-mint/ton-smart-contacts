import type * as A from "./ast";
import type { AstId } from "./ast";
/**
 * Check if input expression is a 'path expression',
 * i.e. an identifier or a sequence of field accesses starting from an identifier.
 * @param path A path expression to check.
 * @returns An array of identifiers or null if the input expression is not a path expression.
 */
export declare function tryExtractPath(path: A.AstExpression): A.AstId[] | null;
type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export declare const getAstFactory: () => {
    createNode: (src: DistributiveOmit<A.AstNode, "id">) => A.AstNode;
    cloneNode: <T extends A.AstNode>(src: T) => T;
};
export type FactoryAst = ReturnType<typeof getAstFactory>;
export declare function idText(ident: A.AstId | A.AstFuncId | A.AstTypeId): string;
export declare function isInt(ident: A.AstTypeId): boolean;
export declare function isBool(ident: A.AstTypeId): boolean;
export declare function isCell(ident: A.AstTypeId): boolean;
export declare function isSlice(ident: A.AstTypeId): boolean;
export declare function isBuilder(ident: A.AstTypeId): boolean;
export declare function isAddress(ident: A.AstTypeId): boolean;
export declare function isString(ident: A.AstTypeId): boolean;
export declare function isStringBuilder(ident: A.AstTypeId): boolean;
export declare function isSelfId(ident: A.AstId): boolean;
export declare function isWildcard(ident: A.AstId): boolean;
export declare function isRequire(ident: A.AstId): boolean;
export declare function eqNames(left: A.AstId | A.AstTypeId | string, right: A.AstId | A.AstTypeId | string): boolean;
export declare function idOfText(text: string): A.AstId;
export declare function astNumToString(n: A.AstNumber): string;
export declare function eqExpressions(ast1: A.AstExpression, ast2: A.AstExpression): boolean;
export declare function isLiteral(ast: A.AstExpression): ast is A.AstLiteral;
export declare const selfId: AstId;
export {};
