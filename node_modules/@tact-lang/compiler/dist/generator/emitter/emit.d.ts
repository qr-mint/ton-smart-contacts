import type { Maybe } from "@ton/core/dist/utils/maybe";
import type { WrittenFunction } from "../Writer";
export declare function emit(args: {
    header?: Maybe<string>;
    functions?: Maybe<WrittenFunction[]>;
}): string;
