import CID from "cids"

type Params = {
  file: Blob
}

export const saveToIPFS2 = async ({ file }: Params) => {
  const form = new FormData()

  form.append("file", file, "file")

  const result = await fetch("https://storage.thirdweb.com/ipfs/upload", {
    method: "POST",
    headers: {
      origin: "https://hey.xyz",
      // "x-client-id": getRandom(CLIENT_IDS),
      // "x-client-id": `fb3a8f0afcdd06b8a366d9781dadbac2`,
      "x-client-id": "22f2a1f2653b1f091455a59951c2ecca",
    },
    body: form,
  })
    .then((r) => r.json())
    .catch(console.error)

  try {
    const cid = new CID(result.IpfsHash).toV1().toString("base32")

    console.log("Successfully saved: saveToIPFS2", cid)

    return cid
  } catch (e) {
    console.error(e)
  }
}

export const getRandom = (arr: any[]) =>
  arr[Math.floor(Math.random() * arr.length)]
