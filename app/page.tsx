"use client"

import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex } from "@noble/hashes/utils"
import { useQuery } from "@tanstack/react-query"
import { useSearchParam } from "hooks/useSearchParam"
import { storage } from "lib/storage"
import { getIPFSURL } from "src/getIPFSURL"
import { isServer } from "utils/isServer"

// if (!isServer()) {
//   ;(async () => {
//     const [url, timestamp] = location.search.slice(1).split("/")

//     const hash = bytesToHex(sha256(url))

//     console.log(hash)

//     const keys = await storage(true).keys(`${hash}`)

//     const [data, snapshot] = keys.slice(-2)

//     const time = data.split(":")[1]

//     const cid = await storage(false).get<string>(data)

//     if (!cid) {
//       console.log("no cid found")
//       return
//     }

//     if (!timestamp) {
//       history.replaceState(null, "", `?${url}/${time}`)
//     }

//     console.log(cid)
//   })()
// }

export default function Page() {
  const { url, timestamp } = useSearchParam()

  const { data } = useQuery({
    queryKey: ["cid", timestamp, url],
    queryFn: async () => {
      const hash = bytesToHex(sha256(url))

      const keys = await storage().keys(`${hash}`)

      const [data, snapshot] = keys.slice(-2)

      console.log(data, snapshot)

      const [cid1, cid2] = await Promise.all([
        storage(false).get<string>(data),
        storage(false).get<string>(snapshot),
      ])

      // const [{ value: cid1 }, { value: cid2 }] = await storage(
      //   false,
      // ).getItems<string>([data, snapshot])

      console.log({ cid1, cid2 })

      return { cid1, cid2 }
    },
  })

  console.log({ url, timestamp })

  return (
    <div className="m-2 p-2 text-2xl">
      <div className="">1</div>
    </div>
  )
}
