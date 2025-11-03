export declare const UnbocErrors: (log: (error: string) => void) => {
    argumentHasParameter: (param: string, argName: string) => void;
    unexpectedArgument: (text: string | undefined) => void;
    duplicateArgument: (name: string) => void;
    unexpected: (error: unknown) => void;
};
export type UnbocErrors = ReturnType<typeof UnbocErrors>;
