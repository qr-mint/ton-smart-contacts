import { Address } from "@ton/core";
import axios, { AxiosInstance } from "axios";

export class Client {
  apiKeys: string;
  url: string;
  api: AxiosInstance;

  constructor() {
    this.apiKeys = process.env.TON_API_KEY;
    this.url = "https://testnet.toncenter.com";
    this.api = axios.create({
      baseURL: this.url,
    });

    this.api.interceptors.request.use(async (config) => {
      config.headers["X-API-Key"] = process.env.TONCENTER_API_KEY;
      return config;
    });
  }

  async getNft(address: string) {
    const data = (
      await this.api.get(`/api/v3/nft/items?address=${address}`)
    ).data;
    return data.nft_items[0];
  }

  async getNftsByCollection(
    collectionAddress: string,
    limit: number,
    offset: number
  ) {
    const data = (
      await this.api.get(
        `/api/v3/nft/items?collection_address=${collectionAddress}&limit=${limit}&offset=${offset}`
      )
    ).data;
    return data;
  }
  async getNftsByOwnerAndCollection(collectionAddress: string, owner: string) {
    let offset = 0;
    const limit = 1000;
    const nfts = [];
    const addressRaw = Address.parseFriendly(owner)
      .address.toRawString()
      .toUpperCase();
    while (true) {
      const data = await this.getNftsByCollection(
        collectionAddress,
        limit,
        offset
      );

      if (!data.nft_items || data.nft_items.length === 0) {
        break;
      }

      const ownedNfts = data.nft_items.filter(
        (nft) => addressRaw === nft.owner_address
      );
      nfts.push(...ownedNfts);
      if (data.nft_items.length < limit) {
        break;
      }
      offset += limit;
    }
    return nfts;
  }

  async getNftsByOwner(owner: string, limit: number, offset: number) {
    const data = (
      await this.api.get(
        `/api/v3/nft/items?owner_address=${owner}&limit=${limit}&offset=${offset}`,
      )
    ).data;
    return data.nft_items.map((nft) => ({
      address: Address.parseRaw(nft.address).toString(),
      metadata_uri: nft.content.uri,
      index: nft.index,
      collection: {
        ...nft.collection,
        address: Address.parseRaw(nft.collection.address).toString(),
      }
    }));
  }
  

  async getNftByAddress(address: string) {
    const data = (
      await this.api.get(
        `/api/v3/nft/items?address=${address}&limit=1&offset=0`,
      )
    ).data;
    return data;
  }
 
  async checkNft(collectionAddress: string, owner: string): Promise<boolean> {
    let offset = 0;
    const limit = 1000;
    const addressRaw = Address.parseFriendly(owner)
      .address.toRawString()
      .toUpperCase();
    while (true) {
      const data = await this.getNftsByCollection(
        collectionAddress,
        limit,
        offset
      );

      if (!data.nft_items || data.nft_items.length === 0) {
        break;
      }

      const hasOwner = data.nft_items.some(
        (nft) => addressRaw === nft.owner_address
      );
      if (hasOwner) {
        return true;
      }
      if (data.nft_items.length < limit) {
        return false;
      } else {
        offset += limit;
      }
    }
    return false;
  }

  async getBalance(address: string) {
    const res = await this.api.get(
      `/api/v2/getAddressBalance?address=${address}`,
    );
    return res.data.result;
  }

  async getTransactionsV2(address: string, limit: number, ltHash?: string) {
    let params = `address=${address}&limit=${limit}&archival=true`;
    if (ltHash) {
      const [lt, hash] = ltHash.split(":");
      params += `${params}&lt=${lt}&hash=${hash}`;
    }
    const res = await this.api.get(
      `/api/v2/getTransactions?${params}`,
    );
    return res.data.result;
  }

  async transactionsByMessage(hash: string) {
    const res = await this.api.get(
      `/api/v3/transactionsByMessage?msg_hash=${hash}&direction=in`,
    );
    return res.data;
  }

  async sendBocHash(data: any) {
    const res = await this.api.post(`/api/v2/sendBocReturnHash`, data);
    return res.data;
  }

  async tracesByTxHash(hash: string) {
    const res = await this.api.get(
      `/api/v3/traces?tx_hash=${hash}&include_actions=true`,
    );
    return res.data;
  }

  async tracesByMsgHash(hash: string) {
    const res = await this.api.get(
      `/api/v3/traces?msg_hash=${hash}&include_actions=true`,
    );
    return res.data;
  }

  async trancation(hash: string) {
    const res = await this.api.get(
      `/api/v3/transactions?hash=${hash}`,
    );
    return res.data;
  }

  async getTransactions(hash: string) {
    const res = await this.trancation(hash);
    if (res.transactions.length > 0) {
      return res.transactions;
    }
    const resTraceTx = await this.tracesByTxHash(hash);
    if (resTraceTx.traces.length > 0) {
      const transactions = [];
      for (const trace of resTraceTx.traces) {
        transactions.push(...Object.values(trace.transactions));
      }
      return transactions;
    }
    const resTraceMsg = await this.tracesByMsgHash(hash);
    if (resTraceMsg.traces.length > 0) {
      const transactions = [];
      for (const trace of resTraceMsg.traces) {
        transactions.push(...Object.values(trace.transactions));
      }
      return transactions;
    }
    const resByMsg = await this.transactionsByMessage(hash);
    if (resByMsg.transactions.length > 0) {
      return resByMsg.transactions;
    }
  }

  async jettonBalance (address: string) {
    const res = await this.api.get(
      `/api/v2/getTokenData?address=${address}`,
    );
    if (res.data.ok) {
      return res.data.result.balance;
    }
    if (res.data.code === 409) {
      return "0";
    }
    throw new Error("Error jetton balance");
  }
}
