const axios = require("axios");

export class TonApiClient {
  apiKey: string;
  url: string;
  constructor () {
    this.apiKey = process.env.TON_API_KEY;
    if (process.env.MODE === "dev") {
      this.url = `https://testnet.tonapi.io`;
    } else {
      this.url = `https://tonapi.io`;
    }
  }

  async getNftCollection(
    collectionAddress: string,
  ) {
    const data = (
      await axios.get(
        `${this.url}/v2/nfts/collections/${collectionAddress}`,
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        }
      )
    ).data;
    return data;
  }

  
  async getNftsByCollection(
    collectionAddress: string,
    limit: number,
    offset: number
  ) {
    const data = (
      await axios.get(
        `${this.url}/v2/nfts/collections/${collectionAddress}/items?limit=${limit}&offset=${offset}`,
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        }
      )
    ).data;
    return data;
  }

  async getNftByAddress(
    address: string,
  ) {
    const data = (
      await axios.get(
        `${this.url}/v2/nfts/collections/${address}/items`,
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        }
      )
    ).data;
    return data;
  }

  async getNftsByOwner(
    owner: string,
    limit: number,
    offset: number) {
    const data = (
      await axios.get(
        `${this.url}/v2/accounts/${owner}/nfts&limit=${limit}&offset=${offset}`,
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        }
      )
    ).data;
    return data;
  }

  async getNftsByOwnerAndCollection(owner: string, collectionAddress: string) {
    const data = (
      await axios.get(
        `${this.url}/v2/accounts/${owner}/nfts?collection=${collectionAddress}&limit=1000&offset=0&indirect_ownership=false`,
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        }
      )
    ).data;
    return data;
  }

  async checkNft(collectionAddress: string, owner: string): Promise<boolean> {
    const res = await this.getNftsByOwnerAndCollection(owner, collectionAddress);
    return res.nft_items.length > 0;
  }
}