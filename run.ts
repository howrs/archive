import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex } from "@noble/hashes/utils"
import { STATIC_URLS } from "constants/static"
import { filesize } from "filesize"
import ms from "ms"
import { ofetch } from "ofetch"
import { chromium as chrome } from "playwright-extra"
import type { BrowserContextOptions } from "playwright/test"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import { saveToIPFS2 } from "src/saveToIPFS2"
import { textToBlob, uint8ArrayToBlob } from "undio"
import { archive } from "utils/archive"
import { isDenyList } from "utils/isDenyList"
import { $ } from "zx"
import { getIPFSURL } from "./src/getIPFSURL"

const viewport = {
  width: 1920,
  height: 1080,
}

const browserContext: BrowserContextOptions = {
  colorScheme: "dark",
  viewport,
  locale: "en-US",
  ignoreHTTPSErrors: true,
  bypassCSP: true,
  reducedMotion: "reduce",
  // javaScriptEnabled: false,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
}

const main = async () => {
  const chromium = chrome.use(StealthPlugin())

  const browser = await chromium.launch({
    headless: !!process.env.GITHUB_ACTIONS,
    devtools: false,
    timeout: ms("10m"),
  })

  const context = await browser.newContext(browserContext)

  const page = await context.newPage()

  const url = await readFile("./url", "utf8").then((r) =>
    r.replaceAll("\n", "").trim(),
  )

  const { hostname } = new URL(`https://${url}`)

  if (isDenyList(hostname)) {
    console.log("Deny list: ", hostname)
    return
  }

  console.log({ url })

  const timestamp = Date.now()

  let dom: string

  if (STATIC_URLS[new URL(`https://${url}`).hostname]) {
    dom = await fetch(`https://${url}`).then((r) => r.text())
  } else {
    try {
      await page.goto(`https://${url}`, {
        waitUntil: "load",
        timeout: ms("20s"),
      })

      // wait few secs
      await page.waitForTimeout(ms("3s"))

      // dump dom
      dom = await page.content()
    } catch (e) {
      dom = await fetch(`https://${url}`).then((r) => r.text())
    }
  }

  await writeFile(`./temp/index-1.html`, dom)

  await $`cat temp/index-1.html | monolith - -MIjva -b https://${url} -o temp/index.html`

  await $`rm temp/index-1.html`

  // wait for the page to load
  const hash = bytesToHex(sha256(url))
  const root = `./archive/${hash}`
  const path = `${root}/${timestamp}`

  // create directory
  await mkdir(path, { recursive: true })

  console.log("read file...")

  const [html, buffer, timestamps] = await Promise.all([
    readFile(`./temp/index.html`, "utf8"),
    page.screenshot({ path: `${path}/screenshot.png`, fullPage: true }),
    readFile(`${root}/timestamps`, "utf8").catch(() => ""),
  ])

  await browser.close()

  const htmlBlob = textToBlob(html)

  const fileSize = filesize(htmlBlob.size)

  console.log(`Done! File size: ${fileSize} bytes`)

  await rename(`./temp/index.html`, `${path}/index.html`)

  const [cid1, cid2] = await Promise.all([
    // saveToIPFS({ file: htmlBlob }),
    // saveToIPFS({ file: toBlob(buffer) }),
    saveToIPFS2({ file: htmlBlob }),
    saveToIPFS2({ file: uint8ArrayToBlob(buffer) }),
    archive(`https://${url}`),
  ])

  if (!cid1 || !cid2) {
    throw new Error("Failed to save to IPFS")
  }

  const url1 = getIPFSURL(cid1)
  const url2 = getIPFSURL(cid2)

  console.log({ url1, url2 })

  await Promise.all([
    $`rm ${path}/screenshot.png`,
    $`rm ${path}/index.html`,
    $`rm ./url`,
  ])

  await Promise.all([
    writeFile(`${path}/d`, cid1),
    writeFile(`${path}/s`, cid2),
    writeFile(
      `${root}/timestamps`,
      `${[...timestamps.split("\n"), timestamp].join("\n")}`,
    ),
  ])

  await Promise.all([
    ofetch(url1, {
      timeout: ms("10s"),
    }).catch((e) => null),
    ofetch(url2, {
      timeout: ms("10s"),
    }).catch((e) => null),
  ])
}

main()
