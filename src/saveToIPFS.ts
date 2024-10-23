import CID from "cids"

type Params = {
  body: any
}

export const saveToIPFS = async ({ body }: Params) => {
  const form = new FormData()

  form.append(
    "file",
    new File([body], "file", {
      type: "text/html",
    }),
  )

  const result = await fetch("https://ipfs-relay.crossbell.io/upload", {
    method: "PUT",
    body: form,
  })
    .then((r) => r.json())
    .catch(console.error)

  const cid = new CID(result.cid).toV1().toString("base32")

  return cid
}

export const getRandom = (arr: any[]) =>
  arr[Math.floor(Math.random() * arr.length)]
