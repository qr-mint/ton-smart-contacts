import type { AstNode } from "./ast";
import type { FactoryAst } from "./ast-helpers";
export declare function cloneNode<T extends AstNode>(src: T, { cloneNode }: FactoryAst): T;
