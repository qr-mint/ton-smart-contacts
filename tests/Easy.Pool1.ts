import {
  Address,
  Cell,
  internal,
  beginCell,
  contractAddress,
  StateInit,
  SendMode,
  Dictionary,
  toNano,
  external,
  storeMessage,
} from "@ton/core";

import { OpenedWallet } from "./wallet";
import { TonClient } from "@ton/ton";
import { toncenterClient } from "./clients";
import { Client } from "./clients/toncenter";

const PoolTournamentDexStonFi = Cell.fromHex("b5ee9c7241020c010002d7000114ff00f4a413f4bcf2c80b01020162020b0202cb030a0251d0831c02497c138007434c0c05c6c2497c1383e900c0074c7f4cffc058c608403e293a954902eb8c3e040500ee333559c705f2e191820afaf0805122bef2e19202fa40f40430708e58018040f4966fa531208e4803a4208100fabe93f2c18fde01fa40fa0030702082100f8a7ea5c8cb1f52a0cb3f5003fa0223cf165003cf16cb0021fa02cb00c9718018c8cb0526cf1627fa02cb6accc973fb00029131e2b312e65f0501d83582100f8a1ea55230ba8e5e323402c705f2e191f40430708e4d018040f4966fa531208e3d03a4208100fabe93f2c18fde01fa40fa003070266d73708010c8cb055007cf165005fa0215cb6a12cb1fcb3f226eb39458cf17019132e201c901fb00029131e2b312e65f03e30e0603fe8208b72ea55230ba8e916c2102c705f2e191fa40fa40fa003041308f61358210bb62d09c5220ba8ed38210ba42d09d5220ba8e468210b142d09d12ba8e3802c705f2e19101fa403070208210132b9a2cc8cb1f14cb3f13cb0012cb00c9708018c8cb055003cf168208989680fa0212cb6accc971fb00925f04e2e30de30de207080900f0821030479e805122a1820817bc90a120c200f2e19250337020c85003fa02f828cf1612cb0021fa02cb00c9f8238103e8a0821037c096dfc8cb1f5003cf16f828cf16f828cf1612cb3fccc971708209f3835dc8cb1fcb3f24fa02f828cf16cb00ccc9718018c8cb055005cf165aa0fa0212cb6accc971fb0000ae5b01c705f2e191fa40fa00fa00fa00fa0030c8f828cf16f828cf16c97082100ff8bfc6c8cb1f5006fa025004fa0258fa0201fa02f828cf1612cb00ccc9708018c8cb055003cf16821030479e80fa0212cb6accc971fb00007e3102c705f2e19101fa40fa003070208210595f07bcc8cb1f15cb3f58fa0213cb0112cb00c9718018c8cb055003cf16821011e1a300fa0212cb6accc971fb000013a376a268699ffd2018400009a1e1f5e02d79948e20");

export const PTON_WALLET = Address.parse('EQCk-C5IIexi6MU0au71F64yNbRxLT4WOgWCC-MLC4XinapX');
export const ROUTER = Address.parse("EQDCvLGdPcK4f160UBkLmscVRT3v-PGmPg7NB4kmgJ4CUT8U");

const client = new TonClient({
  endpoint: `https://testnet.toncenter.com/api/v2/jsonRPC`,
  apiKey: process.env.TONCENTER_API_KEY,
});

export class DexStonfiPool {
  private client: TonClient;
  private provider: Client;
  private dexAddress: string;

  index: number;

  constructor(index: number, dexAddress: string) {
    this.index = index;
    this.client = client;
    this.provider = toncenterClient;
    this.dexAddress = dexAddress;
  }

  static async getPoolData(poolAddress: string): Promise<any> {
        console.log('response', poolAddress);
    const response = await client.runMethod(Address.parse(poolAddress), "get_pool");

    const stack = response.stack;
    const index = stack.readNumber();
    const address = stack.readAddress();
    return { index, address };
  }

  private createCodeCell(): Cell {
    return PoolTournamentDexStonFi;
  }

  private createDataCell(): Cell {
    return beginCell()
      .storeUint(this.index, 64)
      .storeAddress(Address.parse(process.env.TON_ADDRESS as string))
      .endCell();
  }

  public get stateInit(): StateInit {
    const code = this.createCodeCell();
    const data = this.createDataCell();
    return { code, data };
  }

  public get address(): Address {
    return contractAddress(0, this.stateInit);
  }

  public async deploy(wallet: OpenedWallet) {
    const seqno = await wallet.contract.getSeqno();
    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano('0.005'),
          to: this.address,
          init: this.stateInit,
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });
    const ext = external({
      to: wallet.contract.address,
      body: transferCell,
    });
    const newCell = beginCell().store(storeMessage(ext)).endCell();
    await this.provider.sendBocHash({
      boc: newCell.toBoc().toString("base64"),
    });
    return { seqno, hash: newCell.hash().toString("hex") };
  }

  static async accrue(wallet: OpenedWallet, params: any) {
    const recipientsDict = Dictionary.empty();
      params.addresses.forEach((recipient: any, index: number) => {
        const recipientData = beginCell()
          .storeAddress(Address.parse(recipient.to))
          .storeCoins(toNano(recipient.amount))
          .endCell();
    
        recipientsDict.set(index, recipientData);
      });
    const body = beginCell()
      .storeUint(0xf8a1ea5, 32)
      .storeUint(params.queryId || 0, 64)
      .storeDict(recipientsDict, Dictionary.Keys.Uint(64), {
        serialize: (src: Cell, buidler) => {
          buidler.storeSlice(src.beginParse());
        },
        parse: (src) => {
          return src.asCell();
        }
      })
      .endCell();
    const seqno = await wallet.contract.getSeqno();

    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano("0.001"),
          to: Address.parse(params.address),
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
    await toncenterClient.sendBocHash({
      boc: newCell.toBoc().toString("base64"),
    });
    return { seqno, hash: newCell.hash().toString("hex") };
  }

  static async jettonAccrue(wallet: OpenedWallet, params: any) {
    const recipientsDict = Dictionary.empty();
      params.addresses.forEach((recipient: any, index: number) => {
        const recipientData = beginCell()
          .storeAddress(Address.parse(recipient.to))
          .storeCoins(toNano(recipient.amount))
          .endCell();
    
        recipientsDict.set(index, recipientData);
      });
    const body = beginCell()
      .storeUint(0xf8a4ea5, 32)
      .storeUint(params.queryId || 0, 64)
      .storeAddress(Address.parse(params.jetton_address))
      .storeDict(recipientsDict, Dictionary.Keys.Uint(64), {
        serialize: (src: Cell, buidler) => {
          buidler.storeSlice(src.beginParse());
        },
        parse: (src) => {
          return src.asCell();
        }
      })
      .endCell();
    const seqno = await wallet.contract.getSeqno();

    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(0.05 + 0.015 * params.addresses.length),
          to: Address.parse(params.address),
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
    await toncenterClient.sendBocHash({
      boc: newCell.toBoc().toString("base64"),
    });
    return { seqno, hash: newCell.hash().toString("hex") };
  }

  static async addGramAsLiquidity (wallet: OpenedWallet, params: any) {
    const body = beginCell()
      .storeUint(0xb72ea5, 32)
      .storeUint(params.queryId || 0, 64)
      .storeAddress(PTON_WALLET)
      .storeAddress(Address.parse(params.router_jetton_address))
      // .storeCoins(toNano('0.0198'))
      .storeCoins(params.min_lp_out)
      .endCell();
    const seqno = await wallet.contract.getSeqno();

    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano('0.91'),
          to: params.address,
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
    await toncenterClient.sendBocHash({
      boc: newCell.toBoc().toString("base64"),
    });
    return { seqno, hash: newCell.hash().toString("hex") };
  }


  static async burnToken(wallet: OpenedWallet, params: any) {
    const body = beginCell()
      .storeUint(0xbb62d09c, 32)
      .storeUint(params.queryId || 0, 64)
      .storeAddress(Address.parse(params.lp_address))
      .storeCoins(params.lp_amount)
      .endCell();
    const seqno = await wallet.contract.getSeqno();

    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(0.2),
          to: params.address,
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
    await toncenterClient.sendBocHash({
      boc: newCell.toBoc().toString("base64"),
    });
    return { seqno, hash: newCell.hash().toString("hex") };
  }
}
