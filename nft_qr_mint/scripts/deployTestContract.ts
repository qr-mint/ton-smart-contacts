import { toNano } from '@ton/core';
import { TestContract } from '../wrappers/TestContract';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const testContract = provider.open(
        TestContract.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('TestContract')
        )
    );

    await testContract.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(testContract.address);

    console.log('ID', await testContract.getID());
}
