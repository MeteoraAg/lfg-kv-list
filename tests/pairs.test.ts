import { expect } from "chai";
import pairs from "../pairs.json";
import { Connection, PublicKey } from "@solana/web3.js";

function parseJson(json: string) {
  try {
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

describe("LFG pair KV test", () => {
  let parsedPairs: String[] = [];

  it("Parse pairs as an array", () => {
    const pairsStr = JSON.stringify(pairs);
    const pairsArr = parseJson(pairsStr);

    expect(pairsArr, "Invalid JSON format").not.null;
    expect(Array.isArray(pairsArr), "Not an array").to.be.true;

    parsedPairs = pairsArr;
  });

  it("Valid public key", () => {
    for (const pairAddress of parsedPairs) {
      expect(() => {
        new PublicKey(pairAddress);
      }).to.not.throw();
    }
  });

  it("Is pool account", async () => {
    const connection = new Connection("https://api.mainnet-beta.solana.com");
    while (parsedPairs.length > 0) {
      const chunkedParsedPairs = parsedPairs.splice(0, 100);
      const accounts = await connection.getMultipleAccountsInfo(
        chunkedParsedPairs.map((address) => new PublicKey(address))
      );
      for (const account of accounts) {
        expect(account).is.not.null;
        expect(account?.owner.toBase58()).to.be.equal(
          "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"
        );
        const disc = account?.data.slice(0, 8);
        expect(
          disc?.equals(new Uint8Array([33, 11, 49, 98, 181, 101, 177, 13]))
        );
      }
    }
  });
});
