import { rm } from "node:fs/promises"
import {
  concurrent,
  entries,
  groupBy,
  join,
  map,
  pipe,
  toArray,
  toAsync,
  uniq,
} from "@fxts/core"
import { createStorage } from "unstorage"
import fsLiteDriver from "unstorage/drivers/fs-lite"

const storage = createStorage({
  driver: fsLiteDriver({ base: `./archive` }),
})

async function main() {
  const keys = await storage.keys("")

  // await pipe(
  //   keys,
  //   groupBy((key) => key.split(":")[0]),
  //   entries,
  //   toAsync,
  //   map(([key, arr]) => {
  //     const timestamps = pipe(
  //       arr,
  //       map((k) => k.split(":")[1]),
  //       uniq,
  //       join("\n"),
  //     )

  //     return storage.set(`${key.split(":")[0]}/timestamps`, timestamps)
  //   }),
  //   concurrent(1000),
  //   toArray,
  // )

  await pipe(
    keys,
    toAsync,
    map(async (key) => {
      const [hash, timestamp, data] = key.split(":")

      if (data) {
        const [k, cid] = data.split("-")
        await storage.del(key)
        await storage.set(`${hash}:${timestamp}:${k}`, cid)
      }
    }),
    concurrent(1000),
    toArray,
  )

  console.log(keys)
}

main()
