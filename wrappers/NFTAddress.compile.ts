import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    targets: [
        'stdlib.fc',
        'nft/params.fc',
        'nft/op-codes.fc',
        'nft/nft-address.fc',
    ],
};