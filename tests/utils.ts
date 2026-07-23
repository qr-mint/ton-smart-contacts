import { Address } from "@ton/core";
import { TonClient } from "@ton/ton";

export function calculateMinOut(
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

export function calculateMinLpOut(
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


export const getStonFiPoolData = async (client: TonClient, address: string) => {
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