import CID from "cids"
import { textToBlob } from "undio"

type Params = {
  file: any
}

export const saveToIPFS = async ({ file }: Params) => {
  const form = new FormData()

  form.append("file", file, "file")

  const result = await fetch("https://ipfs-relay.crossbell.io/upload", {
    method: "PUT",
    body: form,
  })
    .then((r) => r.json())
    .catch(console.error)

  try {
    const cid = new CID(result.cid).toV1().toString("base32")

    console.log("Successfully saved: saveToIPFS", cid)

    return cid
  } catch (e) {
    console.error(e)
  }
}

export const getRandom = (arr: any[]) =>
  arr[Math.floor(Math.random() * arr.length)]
