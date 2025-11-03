"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgParser = void 0;
const iterationLimit = 10000;
const ArgParser = (Errors) => {
    const immediate = (argv) => {
        const [head, ...rest] = argv;
        if (typeof head === "undefined" || head.startsWith("-")) {
            return { kind: "fail" };
        }
        return { kind: "ok", value: ["immediate", head], rest };
    };
    const boolean = (longName, shortName) => (argv) => {
        const [head, ...rest] = argv;
        if (typeof head === "undefined") {
            return { kind: "fail" };
        }
        const isLongMatch = head === "--" + longName;
        const isShortMatch = typeof shortName !== "undefined" && head === "-" + shortName;
        if (isLongMatch || isShortMatch) {
            return { kind: "ok", value: [longName, true], rest };
        }
        return { kind: "fail" };
    };
    const string = (longName, shortName, argName) => (argv) => {
        const result = boolean(longName, shortName)(argv);
        if (result.kind !== "ok") {
            return result;
        }
        const [head, ...rest] = result.rest;
        if (typeof head === "undefined" || head.startsWith("-")) {
            Errors.argumentHasParameter(argv[0], argName);
            return { kind: "error", rest: result.rest };
        }
        return { ...result, value: [result.value[0], head], rest };
    };
    const makeTokenizer = (next) => ({
        next,
        add: (token) => {
            return makeTokenizer((argv) => {
                const res1 = token(argv);
                if (res1.kind === "ok") {
                    return {
                        ...res1,
                        value: (obj) => {
                            const [key, value] = res1.value;
                            // TS can't figure out V is still V
                            (obj[key] = obj[key] || []).push(value);
                        },
                    };
                }
                return next(argv);
            });
        },
        end: (argv) => {
            const result = {};
            let hadErrors = false;
            for (let i = 0; i < iterationLimit; ++i) {
                if (argv.length === 0) {
                    if (!hadErrors) {
                        // TS can't handle identity transform
                        return {
                            kind: "ok",
                            value: result,
                            rest: [],
                        };
                    }
                    else {
                        return { kind: "error", rest: [] };
                    }
                }
                else {
                    const res = next(argv);
                    if (res.kind === "error") {
                        hadErrors = true;
                        argv = res.rest;
                    }
                    else if (res.kind === "ok") {
                        // TS can't handle identity transform
                        res.value(result);
                        argv = res.rest;
                    }
                    else {
                        throw new Error("Unhandled failure");
                    }
                }
            }
            throw new Error("Iteration limit reached");
        },
    });
    const tokenizer = makeTokenizer((argv) => {
        const [head, ...rest] = argv;
        Errors.unexpectedArgument(head);
        return { kind: "error", rest };
    });
    return {
        immediate,
        boolean,
        string,
        tokenizer,
    };
};
exports.ArgParser = ArgParser;
