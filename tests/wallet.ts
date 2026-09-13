import { KeyPair, mnemonicToPrivateKey } from "@ton/crypto";
import { OpenedContract, TonClient, WalletContractV4 } from "@ton/ton";

export type OpenedWallet = {
  contract: OpenedContract<WalletContractV4>;
  keyPair: KeyPair;
};

export async function openWallet(mnemonic: string[]) {
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  const toncenterBaseEndpoint: string =
    process.env.MODE === "dev"
      ? "https://testnet.toncenter.com"
      : "https://toncenter.com";
  const client = new TonClient({
    endpoint: `${toncenterBaseEndpoint}/api/v2/jsonRPC`,
    apiKey: process.env.TONCENTER_API_KEY,
  });

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });

  const contract = client.open(wallet);
  
  return { contract, keyPair };
}
