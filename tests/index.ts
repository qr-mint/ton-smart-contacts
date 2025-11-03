import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, beginCell, toNano } from '@ton/core';
import { Sale } from '../wrappers/NFTAddress.compile';
import { NFTCollection } from '../wrappers/NFTCollection.compile';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { KeyPair, getSecureRandomBytes, keyPairFromSeed } from '@ton/crypto';
import { Helper } from '../wrappers/Helper';
import { randomAddress } from '@ton/test-utils';

import { Cell, Address, beginCell } from 'ton';
import { SmartContract, createTestClient } from 'ton-emulator';
import { writeFileSync } from 'fs';

// Контракт NFT (ваш код из вопроса)
const nftContractCode = `...`; // Вставьте ваш код контракта здесь

describe('TON NFT Item Smart Contract', () => {
  let contract;
  let client;
  let collectionAddress = Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
  let proxyAddress = Address.parse('EQBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBM9c');
  let ownerAddress = Address.parse('EQCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCM9c');
  let newOwnerAddress = Address.parse('EQDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDM9c');
  let randomAddress = Address.parse('EQEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEM9c');

  before(async () => {
    // Компилируем контракт
    writeFileSync('nft-contract.func', nftContractCode);
    // Здесь должен быть вызов компилятора FunC для генерации Fift-кода
    // Для примера предполагаем, что у нас уже есть скомпилированный код
    
    // Создаем экземпляр контракта
    contract = SmartContract.create({
      code: Cell.fromBoc(compiledCode)[0],
      data: beginCell()
        .storeUint(1, 64) // index
        .storeAddress(collectionAddress)
        .storeAddress(proxyAddress)
        .storeAddress(ownerAddress)
        .storeRef(beginCell().storeUint(123, 256).endCell()) // content
        .storeUint(10000, 16) // 10% proxy fee
        .endCell(),
    });

    // Создаем тестовый клиент
    client = createTestClient();
  });

  it('should initialize correctly', async () => {
    const initialState = await client.getContractState(contract.address);
    assert(initialState.state === 'active', 'Contract should be active');
  });

  it('should return correct NFT data', async () => {
    const result = await client.runMethod(contract.address, 'get_nft_data');
    const [init, index, colAddr, proxyAddr, ownerAddr, content, fee] = result.stack;
    
    assert.equal(init.readNumber(), -1, 'Contract should be initialized');
    assert.equal(index.readNumber(), 1, 'Incorrect index');
    assert.equal(colAddr.readAddress().toString(), collectionAddress.toString(), 'Incorrect collection address');
    assert.equal(ownerAddr.readAddress().toString(), ownerAddress.toString(), 'Incorrect owner address');
    assert.equal(fee.readNumber(), 10000, 'Incorrect proxy fee');
  });

  it('should transfer ownership correctly', async () => {
    const transferBody = beginCell()
      .storeUint(0x5fcc3d14, 32) // op::transfer()
      .storeUint(123, 64) // query_id
      .storeAddress(newOwnerAddress)
      .storeAddress(randomAddress) // response_address
      .storeUint(0, 1) // custom_payload
      .storeCoins(toNano('0.05')) // forward_amount
      .endCell();

    await client.sendMessage({
      to: contract.address,
      value: toNano('0.1'),
      body: transferBody,
      from: ownerAddress
    });

    const result = await client.runMethod(contract.address, 'get_nft_data');
    const ownerAddr = result.stack[4];
    assert.equal(ownerAddr.readAddress().toString(), newOwnerAddress.toString(), 'Ownership not transferred');
  });

  it('should reject unauthorized transfer', async () => {
    const transferBody = beginCell()
      .storeUint(0x5fcc3d14, 32) // op::transfer()
      .storeUint(123, 64) // query_id
      .storeAddress(newOwnerAddress)
      .storeAddress(randomAddress) // response_address
      .storeUint(0, 1) // custom_payload
      .storeCoins(toNano('0.05')) // forward_amount
      .endCell();

    try {
      await client.sendMessage({
        to: contract.address,
        value: toNano('0.1'),
        body: transferBody,
        from: randomAddress // Не владелец
      });
      assert.fail('Should have thrown');
    } catch (e) {
      assert.match(e.message, /rejected/, 'Should reject unauthorized transfer');
    }
  });

  it('should distribute funds correctly', async () => {
    const initialBalance = await client.getBalance(contract.address);
    const ownerInitialBalance = await client.getBalance(ownerAddress);
    const proxyInitialBalance = await client.getBalance(proxyAddress);

    const randomOpBody = beginCell()
      .storeUint(0x12345678, 32) // random op
      .storeUint(111, 64) // query_id
      .endCell();

    const sendAmount = toNano('2');
    await client.sendMessage({
      to: contract.address,
      value: sendAmount,
      body: randomOpBody,
      from: randomAddress
    });

    const finalBalance = await client.getBalance(contract.address);
    assert.equal(finalBalance, toNano('0.05'), 'Contract should leave only storage amount');

    // В реальном тесте нужно проверить исходящие сообщения с переводами
    // Здесь просто проверяем, что баланс контракта уменьшился
  });

  it('should allow content editing by owner', async () => {
    const newContent = beginCell().storeUint(456, 256).endCell();
    const editBody = beginCell()
      .storeUint(0x1a0b9d51, 32) // op::edit_content()
      .storeUint(789, 64) // query_id
      .storeRef(newContent)
      .storeAddress(ownerAddress)
      .endCell();

    await client.sendMessage({
      to: contract.address,
      value: toNano('0.1'),
      body: editBody,
      from: ownerAddress
    });

    const result = await client.runMethod(contract.address, 'get_nft_data');
    const content = result.stack[5];
    assert.equal(content.hash().toString('hex'), newContent.hash().toString('hex'), 'Content not updated');
  });

  it('should allow proxy fee withdrawal by proxy', async () => {
    // Сначала пополним контракт
    await client.sendMessage({
      to: contract.address,
      value: toNano('0.15'),
      body: beginCell().endCell(),
      from: randomAddress
    });

    const withdrawBody = beginCell()
      .storeUint(0x12345678, 32) // op::withdraw_proxy_fee()
      .storeUint(222, 64) // query_id
      .endCell();

    await client.sendMessage({
      to: contract.address,
      value: toNano('0.1'),
      body: withdrawBody,
      from: proxyAddress
    });

    const finalBalance = await client.getBalance(contract.address);
    assert.equal(finalBalance, toNano('0.05'), 'After withdraw, only storage amount should remain');
  });
});

function toNano(amount) {
  return BigInt(Math.floor(parseFloat(amount) * 1000000000);
}