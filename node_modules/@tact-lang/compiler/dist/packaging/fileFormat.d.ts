import { z } from "zod";
export declare const fileFormat: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    abi: z.ZodString;
    init: z.ZodObject<{
        kind: z.ZodLiteral<"direct">;
        args: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"simple">;
                type: z.ZodString;
                optional: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
                format: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>>;
            }, "strip", z.ZodTypeAny, {
                type: string;
                kind: "simple";
                format?: string | number | boolean | null | undefined;
                optional?: boolean | null | undefined;
            }, {
                type: string;
                kind: "simple";
                format?: string | number | boolean | null | undefined;
                optional?: boolean | null | undefined;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"dict">;
                format: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>>;
                key: z.ZodString;
                keyFormat: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>>;
                value: z.ZodString;
                valueFormat: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodNumber, z.ZodString]>>>;
            }, "strip", z.ZodTypeAny, {
                value: string;
                kind: "dict";
                key: string;
                format?: string | number | boolean | null | undefined;
                keyFormat?: string | number | boolean | null | undefined;
                valueFormat?: string | number | boolean | null | undefined;
            }, {
                value: string;
                kind: "dict";
                key: string;
                format?: string | number | boolean | null | undefined;
                keyFormat?: string | number | boolean | null | undefined;
                valueFormat?: string | number | boolean | null | undefined;
            }>]>;
        }, "strip", z.ZodTypeAny, {
            type: {
                type: string;
                kind: "simple";
                format?: string | number | boolean | null | undefined;
                optional?: boolean | null | undefined;
            } | {
                value: string;
                kind: "dict";
                key: string;
                format?: string | number | boolean | null | undefined;
                keyFormat?: string | number | boolean | null | undefined;
                valueFormat?: string | number | boolean | null | undefined;
            };
            name: string;
        }, {
            type: {
                type: string;
                kind: "simple";
                format?: string | number | boolean | null | undefined;
                optional?: boolean | null | undefined;
            } | {
                value: string;
                kind: "dict";
                key: string;
                format?: string | number | boolean | null | undefined;
                keyFormat?: string | number | boolean | null | undefined;
                valueFormat?: string | number | boolean | null | undefined;
            };
            name: string;
        }>, "many">;
        prefix: z.ZodOptional<z.ZodObject<{
            bits: z.ZodNumber;
            value: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: number;
            bits: number;
        }, {
            value: number;
            bits: number;
        }>>;
        deployment: z.ZodUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"direct">;
        }, "strip", z.ZodTypeAny, {
            kind: "direct";
        }, {
            kind: "direct";
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"system-cell">;
            system: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            kind: "system-cell";
            system: string | null;
        }, {
            kind: "system-cell";
            system: string | null;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        args: {
            type: {
                type: string;
                kind: "simple";
                format?: string | number | boolean | null | undefined;
                optional?: boolean | null | undefined;
            } | {
                value: string;
                kind: "dict";
                key: string;
                format?: string | number | boolean | null | undefined;
                keyFormat?: string | number | boolean | null | undefined;
                valueFormat?: string | number | boolean | null | undefined;
            };
            name: string;
        }[];
        kind: "direct";
        deployment: {
            kind: "direct";
        } | {
            kind: "system-cell";
            system: string | null;
        };
        prefix?: {
            value: number;
            bits: number;
        } | undefined;
    }, {
        args: {
            type: {
                type: string;
                kind: "simple";
                format?: string | number | boolean | null | undefined;
                optional?: boolean | null | undefined;
            } | {
                value: string;
                kind: "dict";
                key: string;
                format?: string | number | boolean | null | undefined;
                keyFormat?: string | number | boolean | null | undefined;
                valueFormat?: string | number | boolean | null | undefined;
            };
            name: string;
        }[];
        kind: "direct";
        deployment: {
            kind: "direct";
        } | {
            kind: "system-cell";
            system: string | null;
        };
        prefix?: {
            value: number;
            bits: number;
        } | undefined;
    }>;
    sources: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    compiler: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        parameters: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        parameters?: string | null | undefined;
    }, {
        name: string;
        version: string;
        parameters?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    init: {
        args: {
            type: {
                type: string;
                kind: "simple";
                format?: string | number | boolean | null | undefined;
                optional?: boolean | null | undefined;
            } | {
                value: string;
                kind: "dict";
                key: string;
                format?: string | number | boolean | null | undefined;
                keyFormat?: string | number | boolean | null | undefined;
                valueFormat?: string | number | boolean | null | undefined;
            };
            name: string;
        }[];
        kind: "direct";
        deployment: {
            kind: "direct";
        } | {
            kind: "system-cell";
            system: string | null;
        };
        prefix?: {
            value: number;
            bits: number;
        } | undefined;
    };
    abi: string;
    compiler: {
        name: string;
        version: string;
        parameters?: string | null | undefined;
    };
    sources?: Record<string, string> | undefined;
}, {
    code: string;
    name: string;
    init: {
        args: {
            type: {
                type: string;
                kind: "simple";
                format?: string | number | boolean | null | undefined;
                optional?: boolean | null | undefined;
            } | {
                value: string;
                kind: "dict";
                key: string;
                format?: string | number | boolean | null | undefined;
                keyFormat?: string | number | boolean | null | undefined;
                valueFormat?: string | number | boolean | null | undefined;
            };
            name: string;
        }[];
        kind: "direct";
        deployment: {
            kind: "direct";
        } | {
            kind: "system-cell";
            system: string | null;
        };
        prefix?: {
            value: number;
            bits: number;
        } | undefined;
    };
    abi: string;
    compiler: {
        name: string;
        version: string;
        parameters?: string | null | undefined;
    };
    sources?: Record<string, string> | undefined;
}>;
export type PackageFileFormat = z.infer<typeof fileFormat>;
