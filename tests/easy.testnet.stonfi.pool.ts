require("dotenv").config();

import { DexStonfiPool } from "./Easy.Pool1";
import { TonClient, toNano } from "@ton/ton";
import { address, Address, beginCell, external, internal, SendMode, storeMessage } from '@ton/ton';
import { openWallet } from "./wallet";
import { toncenterClient } from "./clients";
import { calculateMinLpOut, calculateMinOut, getStonFiPoolData } from "./utils";
import { StonApiClient } from "@ston-fi/api";

const current = "kkQArEu5lvDp_oKUyziqNF5MJkJ0gbhy5tpHlQK-ShVlk9q0l";//kQDmZuwQfIMxAdmZTvzl-M8s_fti1MQx6FyvWqMjpuA2ZtTI

const sleep = (sec: number) => new Promise((resolve) => setTimeout(resolve, sec));

(async () => {
    const sclient = new StonApiClient();
    console.log(await sclient.getSwapPairs());
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
  const pool = new DexStonfiPool(1, dexPoolAddress);
  console.log(pool.address, 'pool.address');
  console.log(wallet.contract.address, 'my_address');
  //console.log(await pool.deploy(wallet));
  //console.log(current, await DexStonfiPool.getPoolData('current'));
  //await DexStonfiPool.jettonAccrue(wallet, {address: current, jetton_address: 'kQCHYAaMxzfU4kftm0GcsA1GCf1kqvhKzJ-t83v0mTAeKvnL', addresses: [{to: wallet.contract.address.toString({urlSafe: true}), amount:  2039466}]})
  //await DexStonfiPool.accrue(wallet, {address: current, addresses: [{to: wallet.contract.address.toString({urlSafe: true}), amount: 0.913 }]})

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
      min_lp_out: toNano(1),
      address: current 
    };
    const result = await DexStonfiPool.addGramAsLiquidity(wallet, params);
    return result;
  };
  console.log(await addGramToLuquidity());
  //await sleep(2000);

  const burn = async () => {
    const params = {
      queryId: 0,
      lp_amount: toNano(140),
      lp_address: 'kQBCpI7tZNnixb64QNRyNT7PiSNVTpdRKTylzNVIQLgNZzgU',
      address: current 
    };
    const result = await DexStonfiPool.burnToken(wallet, params);
    return result;
  }
  // console.log(await burn());
  // console.log(await (new StonApiClient().getPools()));
})();

// poolAddress, min_out, lp_address