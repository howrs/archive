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

  // encode url
  const { origin, pathname } = new URL(`https://${url}`)

  const data = `${origin}${encodeURIComponent(pathname)}`.replace('https://', '')

  await Bun.write("./url", data)
}

main()
