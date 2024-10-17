import CID from "cids";
import { CLIENT_IDS } from "./env";

type Params = {
  body: any;
};

export const saveToIPFS = async ({ body }: Params) => {
  const form = new FormData();

  form.append(
    "file",
    new File([body], "file", {
      type: "text/html",
    })
  );

  const result = await fetch("https://storage.thirdweb.com/ipfs/upload", {
    method: "POST",
    headers: {
      origin: "https://hey.xyz",
      "x-client-id": getRandom(CLIENT_IDS),
      // "x-client-id": `fb3a8f0afcdd06b8a366d9781dadbac2`,
    },
    body: form,
  })
    .then((r) => r.json())
    .catch(console.error);

  const cid = new CID(result.IpfsHash).toV1().toString("base32");

  return cid;
};

export const getRandom = (arr: any[]) =>
  arr[Math.floor(Math.random() * arr.length)];
