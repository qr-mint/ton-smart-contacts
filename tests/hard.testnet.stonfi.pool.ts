require("dotenv").config();

import { DexStonfiPool } from "./Pool";
import { TonClient, toNano } from "@ton/ton";
import { address, Address, beginCell, external, internal, SendMode, storeMessage } from '@ton/ton';
import { openWallet } from "./wallet";
import { toncenterClient } from "./clients";
import { calculateMinLpOut, calculateMinOut, getStonFiPoolData } from "./utils";

const current = "EQC_orvsYDlO9jQbzuls-KccqWCUkpSL_ZGxyAr4aqCMzOh_";//kQDmZuwQfIMxAdmZTvzl-M8s_fti1MQx6FyvWqMjpuA2ZtTI

const sleep = (sec: number) => new Promise((resolve) => setTimeout(resolve, sec));

(async () => {
    const wallet = await openWallet(process.env.MNEMONIC?.split(" "))
    const url = "https://testnet.toncenter.com";
    const apiKey = process.env.TONCENTER_API_KEY;
    const client = new TonClient({
      endpoint: `${url}/api/v2/jsonRPC`,
      apiKey,
    });
    const router = 'EQDCvLGdPcK4f160UBkLmscVRT3v-PGmPg7NB4kmgJ4CUT8U';
    const router_pton_master = "kQBab8wTyC1ygEuzUdHP2h3hbEtlE7KBdEX7AmXDdR32_huJ";
    const jettonMaster = 'kQCEZ8dxuyPstODWKYC9eEe6j_EWGWqMP3BoZzrqwaxqaZaV';
    const pTonMaster = Address.parse(router_pton_master); // или testnet-адрес pTON master
    const routerAddress = Address.parse(router);
  
    // Вот этот шаг ты пропустил:
    const r1 = await client.runMethod(pTonMaster, "get_wallet_address", [
      { type: "slice", cell: beginCell().storeAddress(routerAddress).endCell() }
    ]);
    const router_pton_wallet = r1.stack.readAddress().toString({urlSafe: true});
    console.log(router_pton_wallet, 'router_pton_wallet');
  
    const r2 = await client.runMethod(Address.parse(jettonMaster), "get_wallet_address", [
      { type: "slice", cell: beginCell().storeAddress(Address.parse(router)).endCell() }
    ]);
    
    const jetton_of_router = r2.stack.readAddress().toString({urlSafe: true});
    console.log(jetton_of_router, 'jetton_of_router');
    const r3 = await client.runMethod(routerAddress, "get_pool_address", [
      { type: "slice", cell: beginCell().storeAddress(address(router_pton_wallet)).endCell() },
      { type: "slice", cell: beginCell().storeAddress(address(jetton_of_router)).endCell() }
    ]);
  const dexPoolAddress = r3.stack.readAddress().toString({ urlSafe: true });
  console.log(dexPoolAddress, 'poolAddress');
  const pool = new DexStonfiPool(0, dexPoolAddress);
  console.log(pool.address, 'pool.address');
  console.log(wallet.contract.address, 'my_address');
  //console.log(await pool.deploy(wallet));
  // await sleep(2000);
  const swap = async () => {
    const poolData = await getStonFiPoolData(client, dexPoolAddress); 
    const fee = poolData.lpFee + poolData.protocolFee;
    const slippage = 100n;
    const amountIn = (await client.getBalance(Address.parse(current))) / BigInt(2);
    const min_out = calculateMinOut(
      amountIn,
      poolData.reserve0,
      poolData.reserve1,
      BigInt(fee),
      slippage
    );
    console.log(min_out, amountIn);
    const params = {
      queryId: 0,
      askJettonWalletAddress: jetton_of_router,
      min_out: min_out,
      address: current,
    };
    const result = await DexStonfiPool.swapGramToJetton(wallet, params);
    return result;
  }
  // console.log(await swap());
  console.log(current, await DexStonfiPool.getPoolData(current));
  //await DexStonfiPool.jettonAccrue(wallet, {address: current, jetton_address: 'kQCHYAaMxzfU4kftm0GcsA1GCf1kqvhKzJ-t83v0mTAeKvnL', addresses: [{to: wallet.contract.address.toString({urlSafe: true}), amount:  2039466}]})
  await DexStonfiPool.accrue(wallet, {address: current, addresses: [{to: wallet.contract.address.toString({urlSafe: true}), amount: 1.11 }]})
  //18653631148748n 2481699n
  //37276667491519n 4963398n
  //2380483094177n 318525n
  //5627325807210n 756039n
  //15705532839439n 2111710n
  //5076193222202n 683060n
  const addGramToLuquidity = async () => {
    const router_jetton_address = jetton_of_router;
    const poolData = await getStonFiPoolData(client, dexPoolAddress); 
    const fee = poolData.lpFee + poolData.protocolFee;
    const slippage = 100n;
    const amountIn = (await client.getBalance(Address.parse(current)));
    const min_out = calculateMinOut(
      amountIn,
      poolData.reserve0,
      poolData.reserve1,
      BigInt(fee),
      slippage
    );
    const min_lp_out = calculateMinLpOut(
      2481699n,
      18366589257046n,
      poolData.reserve0,
      poolData.reserve1,
      poolData.totalSupply,
      slippage
    );
    console.log(min_out, min_lp_out, amountIn);
    const params = {
      queryId: 0,
      router_jetton_address,
      amount: amountIn,
      min_lp_out: min_lp_out,
      address: current 
    };
    const result = await DexStonfiPool.addGramAsLiquidity(wallet, params);
    return result;
  };
  // console.log(await addGramToLuquidity());
  await sleep(2000);
  //2511111922405411n 900125999865n 334925003n
  //2508811155559619n 899664819366n 334888559n
  //2525238384791579n 905935268463n 337370300n
  const addJettonToLuquidity = async () => {
    const router_jetton_address = jetton_of_router;
    const poolData = await getStonFiPoolData(client, dexPoolAddress); 
    const fee = poolData.lpFee + poolData.protocolFee;
    const slippage = 100n;
    const amountIn = (await client.getBalance(Address.parse('kQCHYAaMxzfU4kftm0GcsA1GCf1kqvhKzJ-t83v0mTAeKvnL')));
    const min_out = calculateMinOut(
      343209412n,
      poolData.reserve0,
      poolData.reserve1,
      BigInt(fee),
      slippage
    );
    const min_lp_out = calculateMinLpOut(
      2481699n,
      18366589257046n,
      poolData.reserve0,
      poolData.reserve1,
      poolData.totalSupply,
      slippage
    );
    console.log(min_out, amountIn);
    const params = {
      queryId: 0,
      router_jetton_address,
      jetton_amount: 18366589257046n,
      min_lp_out: 6637492359n,
      address: current,
    };
    console.log(params);
    const result = await DexStonfiPool.addJettonAsLuquidity(wallet, params);
    return result;
  };
  // console.log(await addJettonToLuquidity());
  const burn = async () => {

  }
})();

// poolAddress, min_out, lp_address