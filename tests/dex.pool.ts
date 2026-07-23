import { TonClient } from "@ton/ton";
import { DEX } from "@ston-fi/sdk";

async function main() {
  const client = new TonClient({
    endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  });

  const router = client.open(
    DEX.v2_1.Router.CPI.create("EQDCvLGdPcK4f160UBkLmscVRT3v-PGmPg7NB4kmgJ4CUT8U"), // CPI Router v2.1.0 (testnet)
  );
  
  // Тест 1: пара из официальной документации (TesREED / TestBlue)
  try {
    const poolAddress1 = await router.getPoolAddress({
      token0: "kQDLvsZol3juZyOAVG8tWsJntOxeEZWEaWCbbSjYakQpuYN5", // TesREED
      token1: "kQB_TOJSB7q3-Jm1O8s0jKFtqLElZDPjATs5uJGsujcjznq3",  // TestBlue
    });
    console.log("Pool TesREED/TestBlue:", poolAddress1.toString());
  } catch (e) {
    console.log("Pool TesREED/TestBlue: ОШИБКА —", (e as Error).message);
  }

  // Тест 2: твоя пара TON / TestBlue, через те же router_pton_wallet / jetton_of_router,
  // что ты уже получил вручную
  try {
    const poolAddress2 = await router.getPoolAddress({
      token0: "EQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABqox", // router_pton_wallet
      token1: "EQBw6tuHsnMXTz92pz820zdTZmRYUN-grIrGLWVMadGes4-9", // jetton_of_router (TestBlue wallet Router'а)
    });
    console.log("Pool TON/TestBlue:", poolAddress2.toString());
  } catch (e) {
    console.log("Pool TON/TestBlue: ОШИБКА —", (e as Error).message);
  }
}

main();