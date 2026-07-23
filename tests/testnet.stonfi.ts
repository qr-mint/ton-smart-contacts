import { StonApiClient } from "@ston-fi/api";
require("dotenv").config();
import { TonClient, toNano } from "@ton/ton";
import { address, Address, beginCell, external, internal, SendMode, storeMessage } from '@ton/ton';
import { openWallet } from "./wallet";
import { toncenterClient } from "./clients";

const sleep = (sec: number) => new Promise((resolve) => setTimeout(resolve, sec));

const stonApiClient = new StonApiClient();
//EQDTb1w1TCohFqnNcyPrrbbBJQdAwwPn8DbCoaSUd0S5T4fB
(async () => {
  //EQDJ5TRRw5O8aIRqAFf-iqaaNj0Gmu_YRfABS8Td_dMEDY3E
  //EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c
  
  const url = "https://testnet.toncenter.com";
  const apiKey = process.env.TONCENTER_API_KEY;
  const client = new TonClient({
    endpoint: `${url}/api/v2/jsonRPC`,
    apiKey,
  });

  //const pools = await stonApiClient.getPools();
  //console.log(pools);
  const router = 'EQDCvLGdPcK4f160UBkLmscVRT3v-PGmPg7NB4kmgJ4CUT8U';
  const router_pton_master = "kQBab8wTyC1ygEuzUdHP2h3hbEtlE7KBdEX7AmXDdR32_huJ";
  const jettonMaster = 'kQCEZ8dxuyPstODWKYC9eEe6j_EWGWqMP3BoZzrqwaxqaZaV';
  const myAddress = Address.parse("0QAvDOuigmarD5dON44BFRCKyWyvpjQ4_4XkYUX63QOShrE6");
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
  const poolAddress = r3.stack.readAddress().toString({ urlSafe: true });
  console.log(poolAddress, 'poolAddress');
  
//   function calculateMinOut(
//   amountIn: string,      // сколько TON отправляешь (в нанотонах)
//   reserveIn: string,     // резерв TON в пуле
//   reserveOut: string,    // резерв TOKEN в пуле
//   feeBps: string,        // суммарная комиссия в б.п. (lp_fee + protocol_fee из get_pool_data)
//   slippageBps: number    // допустимое проскальзывание, например 100 = 1%
// ): string {
//   const FEE_DIVIDER = new BigNumber(10000);

//   const _amountIn = new BigNumber(amountIn);
//   const _reserveIn = new BigNumber(reserveIn);
//   const _reserveOut = new BigNumber(reserveOut);
//   const _feeBps = new BigNumber(feeBps);
//   const _slippageBps = new BigNumber(slippageBps);

//   // ожидаемый amount_out по формуле constant product
//   const amountOut = _amountIn
//     .multipliedBy(FEE_DIVIDER.minus(_feeBps))
//     .multipliedBy(_reserveOut)
//     .dividedToIntegerBy(
//       _reserveIn.multipliedBy(FEE_DIVIDER)
//         .plus(_amountIn.multipliedBy(FEE_DIVIDER.minus(_feeBps)))
//     );

//     const minOut = amountOut
//       .multipliedBy(FEE_DIVIDER.minus(_slippageBps))
//       .dividedToIntegerBy(FEE_DIVIDER);

//     return minOut.toFixed(0); // целое число как строка, без экспоненциальной записи
//   }

  function calculateMinOut(
    amountIn: bigint,      // сколько TON отправляешь (в нанотонах)
    reserveIn: bigint,     // резерв TON в пуле
    reserveOut: bigint,    // резерв TOKEN в пуле
    feeBps: bigint,        // суммарная комиссия в б.п. (получи из get_pool_data: lp_fee + protocol_fee)
    slippageBps: bigint    // допустимое проскальзывание, например 100n = 1%
  ): bigint {
    const FEE_DIVIDER = 10000n;

  // ожидаемый amount_out по формуле constant product
    const amountOut =
      (amountIn * (FEE_DIVIDER - feeBps) * reserveOut) /
      (reserveIn * FEE_DIVIDER + amountIn * (FEE_DIVIDER - feeBps));

  // применяем допустимое проскальзывание
    const minOut = (amountOut * (FEE_DIVIDER - slippageBps)) / FEE_DIVIDER;

    return minOut;
  }

  function calculateMinLpOut(
    amount0: bigint,        // сколько TON добавляешь (в нанотонах)
    amount1: bigint,        // сколько TOKEN добавляешь (в минимальных единицах)
    reserve0: bigint,       // текущий резерв TON в пуле
    reserve1: bigint,       // текущий резерв TOKEN в пуле
    totalSupply: bigint,    // текущий total_supply LP токенов
    slippageBps: bigint     // допустимое проскальзывание, например 100n = 1%
  ): bigint {
    const FEE_DIVIDER = 10000n;

  // Если пул уже существует — liquidity = min(по token0, по token1)
    const liquidityBy0 = (amount0 * totalSupply) / reserve0;
    const liquidityBy1 = (amount1 * totalSupply) / reserve1;
    const liquidity = liquidityBy0 < liquidityBy1 ? liquidityBy0 : liquidityBy1;

    const minLpOut = (liquidity * (FEE_DIVIDER - slippageBps)) / FEE_DIVIDER;

    return minLpOut;
  }

  const getPoolData = async (address: string) => {
    const poolAddress = Address.parse(address);
    const result = await client.runMethod(poolAddress, "get_pool_data");
  
    const isLocked = result.stack.readBoolean();
    const routerAddress = result.stack.readAddress();
    const totalSupply = result.stack.readBigNumber();
    const reserve0 = result.stack.readBigNumber();   // ← вот он, резерв первого токена
    const reserve1 = result.stack.readBigNumber();   // ← резерв второго токена
    const token0Wallet = result.stack.readAddress();
    const token1Wallet = result.stack.readAddress();
    const lpFee = result.stack.readNumber();
    const protocolFee = result.stack.readNumber();
    const protocolFeeAddress = result.stack.skip();
    const collectedFee0 = result.stack.readBigNumber();
    const collectedFee1 = result.stack.readBigNumber();
    return {
      isLocked, routerAddress, totalSupply,
      reserve0, reserve1,
      token0Wallet, token1Wallet,
      lpFee, protocolFee,
      protocolFeeAddress,
      collectedFee0, collectedFee1
    };
  }
  

// // Пример на твоих реальных данных
// const minLpOut = calculateMinLpOut(
//   1_000_000_000n,           // 1 TON
//   7675824449526391n,        // соответствующее количество TOKEN (посчитано пропорционально)
//   130279045235n,            // reserve0
//   999999080675767791n,      // reserve1
//   360652187016798n,         // totalSupply
//   100n                      // 1% slippage
// );

  // const poolAddress = 'kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v';
  const poolData = await getPoolData(poolAddress);
  console.log(poolData);
  const testSwap = async () => {
    const wallet = await openWallet(process.env.MNEMONIC?.split(" "))
    const reverse0 = poolData.reserve0;
    const reverse1 = poolData.reserve1;
    const fee = poolData.lpFee + poolData.protocolFee;
    const slippage = 100n;
    const half_balance = 0.001;
    const min_out = calculateMinOut(
      toNano(half_balance),
      reverse0,
      reverse1,
      BigInt(fee),
      slippage
    );
    console.log(min_out, 'min_out');
    const askJettonWalletAddress = Address.parse(jetton_of_router); //??

    const additional_data = beginCell()
      .storeCoins(min_out)
      .storeAddress(wallet.contract.address)
      .storeCoins(BigInt(0))
      .storeUint(0, 1)
      .storeCoins(0)
      .storeUint(0, 1)
      .storeUint(10, 16)
      .storeAddress(null)
      .endCell();

    const swap_payload = beginCell()
      .storeUint(0x6664de2a, 32)
      .storeAddress(askJettonWalletAddress)
      .storeAddress(wallet.contract.address)
      .storeAddress(wallet.contract.address)
      .storeUint(Math.floor(Date.now() / 1000) + 15 * 60, 64)
      .storeRef(additional_data)
      .endCell();

    const body = beginCell()
      .storeUint(0x01f3835d, 32)
      .storeUint(0, 64)
      .storeCoins(toNano(half_balance))
      .storeAddress(wallet.contract.address)
      .storeUint(1, 1)
      .storeRef(swap_payload)
      .endCell();

   

    const seqno = await wallet.contract.getSeqno();
  
    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(half_balance + 0.3),
          to: Address.parse(router_pton_wallet),
          body,
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });
    console.log(wallet.contract.address);
    const ext = external({
      to: wallet.contract.address,
      body: transferCell,
    });
    const newCell = beginCell().store(storeMessage(ext)).endCell();
    const res = await toncenterClient.sendBocHash({
      boc: newCell.toBoc().toString("base64"),
    });
    console.log(res);
  };
  // try {
  //   await testSwap();
  // } catch (err) {
  //   console.error(err);
  // }
  const reverse0 = poolData.reserve0;
  const reverse1 = poolData.reserve1;
  const fee = poolData.lpFee + poolData.protocolFee;
  const slippage = 100n;
  const half_balance = 0.001;
  const min_out = calculateMinOut(
    toNano(half_balance),
    reverse0,
    reverse1,
    BigInt(fee),
    slippage
  );
  const min_lp_out = toNano(1);
  console.log(min_lp_out, 'min_lp_out');
  const addTonLiquidityPool = async () => {
    const wallet = await openWallet(process.env.MNEMONIC?.split(" "))
    const router_jetton_wallet = Address.parse(jetton_of_router);
    const ton_amount = 0.001;

        
    const lp_payload = beginCell()
      .storeUint(0x37c096df, 32)              
      .storeAddress(router_jetton_wallet)    
      .storeAddress(wallet.contract.address) 
      .storeAddress(wallet.contract.address)         
      .storeUint(Math.floor(Date.now() / 1000) + 15 * 60, 64)     
      .storeRef(
        beginCell()
          .storeCoins(min_lp_out)     
          .storeAddress(myAddress)  
          .storeUint(0, 1)            
          .storeCoins(0) 
          .storeUint(0, 1)
          .endCell()
        )
      .endCell();

    const body = beginCell()
      .storeUint(0x01f3835d, 32)
      .storeUint(0, 64)
      .storeCoins(toNano(ton_amount))
      .storeAddress(wallet.contract.address)
      .storeUint(1, 1)
      .storeRef(lp_payload)
      .endCell();

    const seqno = await wallet.contract.getSeqno();
  
    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(ton_amount + 0.81),
          to: Address.parse(router_pton_wallet),
          body,
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });
    
    const ext = external({
      to: wallet.contract.address,
      body: transferCell,
    });
    const newCell = beginCell().store(storeMessage(ext)).endCell();
    const res = await toncenterClient.sendBocHash({
      boc: newCell.toBoc().toString("base64"),
    });
    console.log(res);
  };
  try {
    await addTonLiquidityPool();
  } catch (err) {
    console.error(err);
  }
  await sleep(2000);
  const addJettonLiquidityPool = async () => {
    const wallet = await openWallet(process.env.MNEMONIC?.split(" "))
    const jetton_wallet = Address.parse('kQAvqhQAob4kgEZNbjsNLOoytQR8s0oWpt2Rtnv7ZyeVL7a_');
    const router_jetton_wallet = Address.parse(jetton_of_router);
    const jetton_amount = min_out;
    const lp_payload = beginCell()
        .storeUint(0x37c096df, 32)
        .storeAddress(Address.parse(router_pton_wallet))
        .storeAddress(wallet.contract.address) 
        .storeAddress(wallet.contract.address)         
        .storeUint(Math.floor(Date.now() / 1000) + 15 * 60, 64) 
        .storeRef(
            beginCell()
                .storeCoins(min_lp_out)
                .storeAddress(wallet.contract.address)
                .storeUint(0, 1)
                .storeCoins(0)
                .storeUint(0, 1)
            .endCell()
        )
        .endCell();
    const body = beginCell()
        .storeUint(0xf8a7ea5, 32)
        .storeUint(0, 64)
        .storeCoins(jetton_amount)
        .storeAddress(Address.parse(router))
        .storeAddress(wallet.contract.address)
        .storeUint(0, 1)    
        .storeCoins(50000000)
        .storeUint(1, 1) 
        .storeRef(lp_payload)
        .endCell();

    const seqno = await wallet.contract.getSeqno();
  
    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(0.15),
          to: jetton_wallet,
          body,
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });
    
    const ext = external({
      to: wallet.contract.address,
      body: transferCell,
    });
    const newCell = beginCell().store(storeMessage(ext)).endCell();
    const res = await toncenterClient.sendBocHash({
      boc: newCell.toBoc().toString("base64"),
    });
    console.log(res);
  };
  try {
    await addJettonLiquidityPool();
  } catch (err) {
    console.error(err);
  }
  const withdrawFee = async () => {
    const wallet = await openWallet(process.env.MNEMONIC?.split(" "))
    const s4 = await client.runMethod(Address.parse(poolAddress), 'get_lp_account_address',
      [{ type: "slice", cell: beginCell().storeAddress(myAddress).endCell() }]);
    const lpAccount = s4.stack.readAddress();
    const lp_amount = toNano('1');
    const body = beginCell()
      .storeUint(0x595f07bc, 32)
      .storeUint(0, 64)
      .storeCoins(lp_amount)
      .storeUint(0, 2)
      .storeUint(0, 1)
      .endCell();
    
    const seqno = await wallet.contract.getSeqno();
  
    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(0.3),
          to: Address.parse('kQAp0JwBthGXaQNgsC5QTg-YwBYxnudrPFJWi3rv8wYENApP'),
          body,
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });
    
    const ext = external({
      to: wallet.contract.address,
      body: transferCell,
    });
    const newCell = beginCell().store(storeMessage(ext)).endCell();
    const res = await toncenterClient.sendBocHash({
      boc: newCell.toBoc().toString("base64"),
    });
    console.log(res);
  };

  // try {
  //   await withdrawFee();
  // } catch (err) {
  //   console.error(err);
  // }
  const lpAddDirectLiquidityPool = async () => {
    const s4 = await client.runMethod(Address.parse(poolAddress), 'get_lp_account_address',
      [{ type: "slice", cell: beginCell().storeAddress(myAddress).endCell() }]);
    const lpAccount = s4.stack.readAddress();
    const amount0 = toNano('0');
    const amount1 = toNano('0');
    const minimumLpToMint = toNano('0');
    const dexCustomPayloadForwardGasAmount = toNano('0');
    const additional_data = beginCell()
      .storeAddress(myAddress)
      .storeAddress(myAddress)
      .endCell();
    const body = beginCell()
      .storeUint(0xff8bfc6, 32)
      .storeCoins(amount0)
      .storeCoins(amount1)
      .storeCoins(minimumLpToMint)
      .storeCoins(dexCustomPayloadForwardGasAmount)
      .storeAddress(myAddress)
      .storeUint(0, 1)
      .storeRef(additional_data)
      .endCell();
    const wallet = await openWallet(process.env.MNEMONIC?.split(" "))
    const seqno = await wallet.contract.getSeqno();
  
    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(0.81),
          to: lpAccount,
          body,
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });
    
    const ext = external({
      to: wallet.contract.address,
      body: transferCell,
    });
    const newCell = beginCell().store(storeMessage(ext)).endCell();
    const res = await toncenterClient.sendBocHash({
      boc: newCell.toBoc().toString("base64"),
    });
    console.log(res);
  };
  // try {
  //   await lpAddDirectLiquidityPool();
  // } catch (err) {
  //   console.error(err);
  // }
  const lp_refund = async () => {
    const s4 = await client.runMethod(Address.parse(poolAddress), 'get_lp_account_address',
      [{ type: "slice", cell: beginCell().storeAddress(myAddress).endCell() }]);
    const lpAccount = s4.stack.readAddress();
    const body = beginCell()
      .storeUint(0x132b9a2c, 32)
      .storeUint(0, 64)
      .storeUint(0, 1)
      .storeUint(0, 1)
      .endCell();
    const wallet = await openWallet(process.env.MNEMONIC?.split(" "))
    const seqno = await wallet.contract.getSeqno();
  
    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(0.1),
          to: lpAccount,
          body,
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });
    
    const ext = external({
      to: wallet.contract.address,
      body: transferCell,
    });
    const newCell = beginCell().store(storeMessage(ext)).endCell();
    const res = await toncenterClient.sendBocHash({
      boc: newCell.toBoc().toString("base64"),
    });
    console.log(res);
  };
  // try {
  //   await lp_refund();
  // } catch (err) {
  //   console.error(err);
  // }
  // const wallet = await openWallet(process.env.MNEMONIC?.split(" "))
  const s4 = await client.runMethod(Address.parse(poolAddress), 'get_lp_account_address',
    [{ type: "slice", cell: beginCell().storeAddress(myAddress).endCell() }]);
  const lpAccount = s4.stack.readAddress()
  console.log(lpAccount, 'lpAccount');
  const s5 = await client.runMethod(lpAccount, 'get_lp_account_data');
  const lp_account = {
    userAddress: s5.stack.readAddress(),
    pool_address: s5.stack.readAddress(),
    amount0: s5.stack.readNumber(),
    amount1: s5.stack.readNumber(),
  };
  console.log(lp_account, 'lp_account');
})();