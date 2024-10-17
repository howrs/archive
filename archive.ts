import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { parseArgs } from "node:util";

async function main() {
  console.log("Hello via Bun!");

  const { values, positionals } = parseArgs({
    args: Bun.argv,
    options: {
      url: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  const { url } = values;

  console.log("url", url);

  if (!url) {
    console.log("url is required");
    return;
  }

  const hash = bytesToHex(sha256(url));

  console.log("hash", hash);
}

main();
