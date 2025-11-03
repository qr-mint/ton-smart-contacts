export declare const CliErrors: (log: (error: string) => void) => {
    /**
     * @deprecated Because there are incompatible loggers, we have to inform
     * top-level logger that there was an error.
     *
     * Will be removed along with { ok: boolean } returns from `build`
     */
    setHadErrors: () => void;
    argumentHasParameter: (param: string, argName: string) => void;
    unexpectedArgument: (text: string | undefined) => void;
    duplicateArgument: (name: string) => void;
    unexpected: (error: unknown) => void;
    configNotFound: (path: string) => void;
    configError: (path: string, text: string) => void;
    incompatibleFlags: () => void;
    noSuchProject: (name: string) => void;
};
export type CliErrors = ReturnType<typeof CliErrors>;
