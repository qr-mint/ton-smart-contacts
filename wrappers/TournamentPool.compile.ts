import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    targets: [
        'stdlib.fc',
        'pool/op-codes.fc',
        'pool/tournament.fc',
    ],
};