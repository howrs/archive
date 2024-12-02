"use client"

import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex } from "@noble/hashes/utils"
import { useQuery } from "@tanstack/react-query"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { useQueryState } from "nuqs"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { getIPFSURL } from "src/getIPFSURL"

type FormValue = {
  url: string
}

export default function Page() {
  const [url, setURL] = useQueryState("url", { defaultValue: "" })
  const [timestamp, setTimestamp] = useQueryState("timestamp", {
    defaultValue: "",
  })

  console.log({ url, timestamp })

  const { register, handleSubmit } = useForm<FormValue>({
    defaultValues: {
      url,
    },
  })

  const hash = useMemo(() => bytesToHex(sha256(url)), [url])

  const {
    data: timestamps,
    isSuccess,
    refetch: r1,
  } = useQuery({
    queryKey: ["timestamps", url],
    queryFn: async () => {
      const timestamps = await fetch(
        `https://raw.githubusercontent.com/howrs/archive/refs/heads/main/archive/${hash}/timestamps`,
      )
        .then((res) => res.text())
        .then((res) => res.split("\n").filter((v) => /^\d+$/.test(v)))

      return timestamps
    },
    staleTime: Number.MAX_SAFE_INTEGER,
  })

  const {
    data,
    isPending,
    refetch: r2,
  } = useQuery({
    queryKey: ["cid", timestamp, url],
    queryFn: async () => {
      if (!timestamps) {
        return
      }

      const time = timestamps.at(-1)

      const [cid1, cid2] = await Promise.all([
        fetch(
          `https://raw.githubusercontent.com/howrs/archive/refs/heads/main/archive/${hash}/${time}/d`,
        ).then((res) => res.text()),
        fetch(
          `https://raw.githubusercontent.com/howrs/archive/refs/heads/main/archive/${hash}/${time}/s`,
        ).then((res) => res.text()),
      ])

      if (time && !timestamp) {
        setTimestamp(time)
      }

      return { cid1, cid2 }
    },
    enabled: isSuccess,
  })

  const onSubmit = handleSubmit((data) => {
    const url = data.url
      .replace("http://", "")
      .replace("https://", "")
      .replace(/\/$/, "")

    setURL(url)
  })

  return (
    <div className="flex h-dvh flex-col">
      <form className="p-2" onSubmit={onSubmit}>
        <Input {...register("url")} className="" />
      </form>
      {/* timestamps */}
      {timestamps && (
        <div className="flex flex-wrap gap-2 p-2">
          {timestamps.map((t) => (
            <Button
              asChild
              key={t}
              variant={t === timestamp ? "default" : "secondary"}
            >
              <Link href={`?url=${url}&timestamp=${t}`}>{t}</Link>
            </Button>
          ))}
        </div>
      )}
      <Tabs
        defaultValue="website"
        className="relative flex w-full flex-1 flex-col pt-8"
      >
        <TabsList className="w-fit self-center">
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="snapshot">Snapshot</TabsTrigger>
        </TabsList>
        {data ? (
          <>
            <TabsContent
              value="website"
              className="flex w-full flex-1 overflow-y-auto data-[state=inactive]:hidden"
              forceMount
            >
              {data.cid1 && (
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
              {data.cid2 && (
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
          </>
        ) : isPending ? (
          <div>Loading...</div>
        ) : (
          <div>Not found</div>
        )}
      </Tabs>
    </div>
  )
}
