export declare const isColorSupported: () => boolean | 0 | undefined;
export declare const getAnsiMarkup: (isEnabled: boolean, f?: (f: (x: string) => string) => (x: string) => string) => {
    reset: (x: string) => string;
    bold: (x: string) => string;
    red: (x: string) => string;
    green: (x: string) => string;
    yellow: (x: string) => string;
    blue: (x: string) => string;
    magenta: (x: string) => string;
    cyan: (x: string) => string;
    white: (x: string) => string;
    gray: (x: string) => string;
};
export type AnsiMarkup = ReturnType<typeof getAnsiMarkup>;
