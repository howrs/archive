"use client"

import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex } from "@noble/hashes/utils"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs"
import { useSearchParam } from "hooks/useSearchParam"
import { storage } from "lib/storage"
import { cn } from "lib/utils"
import Image from "next/image"
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
        replace(`?${url}:${time}`)
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
      <Tabs
        defaultValue="website"
        className="relative flex w-full flex-1 flex-col pt-8"
      >
        <TabsList className="w-fit self-center">
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="snapshot">Snapshot</TabsTrigger>
        </TabsList>
        <TabsContent
          value="website"
          className="flex w-full flex-1 overflow-auto data-[state=inactive]:hidden"
          forceMount
        >
          {data?.cid1 && (
            <iframe
              className="w-full flex-1"
              title={`Archive of ${url} at ${timestamp}`}
              src={getIPFSURL(data.cid1)}
            />
          )}
        </TabsContent>
        <TabsContent
          value="snapshot"
          className="flex w-full flex-1 overflow-y-auto data-[state=inactive]:hidden"
          forceMount
        >
          {data?.cid2 && (
            <div className="w-full">
              <Image
                priority
                unoptimized
                width={1920}
                height={1080}
                className=""
                objectFit="cover"
                src={getIPFSURL(data.cid2)}
                alt={`Snapshot of ${url} at ${timestamp}`}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
