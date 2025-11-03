import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TestContract } from '../wrappers/TestContract';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TestContract', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TestContract');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let testContract: SandboxContract<TestContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        testContract = blockchain.openContract(
            TestContract.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                },
                code
            )
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await testContract.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: testContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and testContract are ready to use
    });

    it('should increase counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await testContract.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = Math.floor(Math.random() * 100);

            console.log('increasing by', increaseBy);

            const increaseResult = await testContract.sendIncrease(increaser.getSender(), {
                increaseBy,
                value: toNano('0.05'),
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: testContract.address,
                success: true,
            });

            const counterAfter = await testContract.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });
});
