import { parseArgs } from "node:util"

async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv,
    options: {
      url: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  })

  const { url } = values

  if (!url) {
    console.log("url is required")
    return
  }

  await Bun.write("./url", encodeURIComponent(url))
}

main()
