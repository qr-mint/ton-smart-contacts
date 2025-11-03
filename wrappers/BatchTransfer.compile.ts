import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    targets: ['stdlib.fc','bt/op-codes.fc','bt/batch-transfer.fc'],
};
