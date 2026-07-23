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

const PoolTournamentDexStonFi = Cell.fromHex("b5ee9c7241021101000449000114ff00f4a413f4bcf2c80b0102016202100202cb030f0257d3b68bb7ec831c02497c138007434c0c05c6c2497c1383e900c0074c7f4cffc05a08403e293a954942eb8c3e040500f031333559c705f2e191820afaf0805122bef2e19202fa40f40430708e58018040f4966fa531208e4803a4208100fabe93f2c18fde01fa40fa0030702082100f8a7ea5c8cb1f52a0cb3f5003fa0223cf165003cf16cb0021fa02cb00c9718018c8cb0526cf1627fa02cb6accc973fb00029131e2b312e65f0502f23682100f8a1ea55240ba8e5f30323402c705f2e191f40430708e4d018040f4966fa531208e3d03a4208100fabe93f2c18fde01fa40fa003070266d73708010c8cb055007cf165005fa0215cb6a12cb1fcb3f226eb39458cf17019132e201c901fb00029131e2b312e65f038f0b82100b8a1ea55240bae30fe2060801fe30325023c705f2e191fa40fa40fa00fa0030821011e1a3005166a1820817bc90a122bef2e192707a5311c85005fa02f828cf1621fa0214cb0022fa0213cb0012cb0fcb01c9f8238103e8a082106664de2ac8cb1f5004cf16f828cf16f828cf1613cb3f12ccc9718209f3835dc8cb1f15cb3f22fa02f828cf1614cb0013ccc9070030718018c8cb055003cf165034a013fa0212cb6accc971fb00035e82100b3a3ea55240ba8f228208b72ea55240ba8e96135f0302c705f2e191fa40fa40fa00fa003010341023e30ee30d090a0d00ec821030479e805133a122a1820817bc90bef2e192137020c85003fa02f828cf1612cb0021fa02cb00c9f8238103e8a0821037c096dfc8cb1f5003cf16f828cf16f828cf1612cb3fccc971708209f3835dc8cb1fcb3f24fa02f828cf16cb00ccc9718018c8cb055005cf165aa0fa0212cb6accc971fb0002f0368210bb62d09c5230ba8eea8210ba42d09d5230ba8e5d8210b142d09d5230ba8e32323402c705f2e191fa40308210132b9a2cc8cb1f12cb3fc9718018c8cb055003cf1682102faf0800fa0212cb6accc971fb008e1d316c228210db2d094c12ba9ffa403001c8cb3f01cf16c9ed54db31e05be2e30de30d0b0c00b0355b01c705f2e191fa40fa00fa00fa00fa0030c8f828cf16f828cf16c97082100ff8bfc6c8cb1f5006fa025004fa0258fa0201fa02f828cf1612cb00ccc9718018c8cb055003cf16821011e1a300fa0212cb6accc971fb00007e323402c705f2e191fa40fa003070208210595f07bcc8cb1f15cb3f58fa0213cb0112cb00c9718018c8cb055003cf16821011e1a300fa0212cb6accc971fb0001fe135f033301c705f2e191fa40fa40fa40fa00fa003082100e4e1c008210202fbf00707a5311c85007fa02f828cf1621fa0216cb0022fa0215cb0014cb0f13cb01c982106664de2ac8cb1f5006cf16f828cf16f828cf1615ccc971702082100f8a7ea5c8cb1fcb3f5005fa025005cf16f828cf1613cb005004fa0212cb00ccc90e002a718018c8cb055004cf1658fa0212cb6accc971fb000013a376a268699ffd2018400009a1e1f5e02d18cd2ee2");

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

  static async swapGramToJetton(wallet: OpenedWallet, params: any) {
    const body = beginCell()
      .storeUint(0xb8a1ea5, 32)
      .storeUint(params.queryId || 0, 64)
      .storeAddress(PTON_WALLET)
      .storeAddress(Address.parse(params.askJettonWalletAddress))
      .storeCoins(params.amount)
      .storeCoins(params.min_out)
      .endCell();
    const seqno = await wallet.contract.getSeqno();
  
    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(0.4),
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

  static async swapJettonToGram(wallet: OpenedWallet, params: any) {
    const body = beginCell()
      .storeUint(0xb3a3ea5, 32)
      .storeUint(params.queryId || 0, 64)
      .storeAddress(Address.parse(params.my_jetton_wallet))
      .storeAddress(PTON_WALLET)
      .storeAddress(ROUTER)
      .storeCoins(params.token)
      .storeCoins(params.min_out)
      .endCell();
    const seqno = await wallet.contract.getSeqno();
  
    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(0.54),
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

  static async refund(wallet: OpenedWallet, params: any) {
    const body = beginCell()
      .storeUint(0xb142d09d, 32)
      .storeUint(params.queryId || 0, 64)
      .storeAddress(Address.parse(params.lp_account))
      .endCell();
    const seqno = await wallet.contract.getSeqno();
  
    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(0.4),
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

  static async addDirecentLiquidity(wallet: OpenedWallet, params: any) {
    const body = beginCell()
      .storeUint(0xba42d09d, 32)
      .storeUint(params.queryId || 0, 64)
      .storeAddress(Address.parse(params.lp_account))
      .storeCoins(params.amount0)
      .storeCoins(params.amount1)
      .storeCoins(params.minimumLpToMint)
      .storeCoins(params.dexCustomPayloadForwardGasAmount)
      .endCell();
    const seqno = await wallet.contract.getSeqno();
  
    const transferCell = wallet.contract.createTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: toNano(0.54),
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
