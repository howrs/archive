"use client"

import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex } from "@noble/hashes/utils"
import { useQuery } from "@tanstack/react-query"
import { useSearchParam } from "hooks/useSearchParam"
import { storage } from "lib/storage"
import { useRouter } from "next/navigation"
import { getIPFSURL } from "src/getIPFSURL"

export default function Page() {
  const { url, timestamp } = useSearchParam()
  const { replace } = useRouter()

  const { data, isPending } = useQuery({
    queryKey: ["cid", timestamp, url],
    queryFn: async () => {
      const hash = bytesToHex(sha256(url))

      const keys = await storage().keys(`${hash}`)

      if (keys.length === 0) {
        return null
      }

      const [data, snapshot] = keys.slice(-2)

      const cid1 = data.split(":").pop()?.slice(2)
      const cid2 = snapshot.split(":").pop()?.slice(2)
      const time = data.split(":").at(-2)

      if (time !== timestamp) {
        replace(`?${url}/${time}`)
      }

      return { cid1, cid2 }
    },
  })

  if (isPending) {
    return <div>Loading...</div>
  }

  if (!isPending && !data) {
    return <div>Not found</div>
  }

  return (
    <div className="flex h-dvh text-2xl">
      {data?.cid1 && (
        <iframe
          className="mt-16 w-full flex-1"
          title={`Archive of ${url} at ${timestamp}`}
          src={getIPFSURL(data.cid1)}
        />
      )}
    </div>
  )
}
