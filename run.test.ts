import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex } from "@noble/hashes/utils"
import { expect, test } from "@playwright/test"
import { STATIC_URLS } from "constants/static"
import { filesize } from "filesize"
import ms from "ms"
import { chromium } from "playwright-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import { textToBlob, toBlob } from "undio"
import { $ } from "zx"
import { getIPFSURL } from "./src/getIPFSURL"
import { saveToIPFS } from "./src/saveToIPFS"

const viewport = {
  width: 1920,
  height: 1080,
}

test.use({
  colorScheme: "dark",
  viewport,
  locale: "en-US",
  ignoreHTTPSErrors: true,
  bypassCSP: true,
  contextOptions: {
    reducedMotion: "reduce",
  },
  // javaScriptEnabled: false,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
})

test("archive", async () => {
  chromium.use(StealthPlugin())

  const browser = await chromium.launch({
    headless: !!process.env.GITHUB_ACTIONS,
    devtools: false,
    timeout: ms("10m"),
  })

  const page = await browser.newPage()

  const url = await readFile("./url", "utf8")

  console.log({ url })

  const timestamp = Date.now()

  let dom: string

  if (STATIC_URLS[new URL(url).hostname]) {
    dom = await fetch(url).then((r) => r.text())
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
      dom = await fetch(url).then((r) => r.text())
    }
  }

  await writeFile(`./temp/index-1.html`, dom)

  await $`cat temp/index-1.html | monolith - -MIjva -b https://${url} -o temp/index.html`

  await $`rm temp/index-1.html`

  // wait for the page to load
  const hash = bytesToHex(sha256(url))
  const path = `./archive/${hash}/${timestamp}`

  // create directory
  await mkdir(path, { recursive: true })

  console.log("read file...")

  const [html, buffer] = await Promise.all([
    readFile(`./temp/index.html`, "utf8"),
    page.screenshot({ path: `${path}/screenshot.png`, fullPage: true }),
  ])

  await browser.close()

  const htmlBlob = textToBlob(html)

  const fileSize = filesize(htmlBlob.size)

  console.log(`Done! File size: ${fileSize} bytes`)

  await rename(`./temp/index.html`, `${path}/index.html`)

  const [cid1, cid2] = await Promise.all([
    saveToIPFS({ body: htmlBlob }),
    saveToIPFS({ body: toBlob(buffer) }),
  ])

  const url1 = getIPFSURL(cid1)
  const url2 = getIPFSURL(cid2)

  console.log({ url1, url2 })

  Promise.all([fetch(url1), fetch(url2)])

  await Promise.all([
    $`rm ${path}/screenshot.png`,
    $`rm ${path}/index.html`,
    $`rm ./url`,
  ])

  await Promise.all([
    writeFile(`${path}/d-${cid1}`, ""),
    writeFile(`${path}/s-${cid2}`, ""),
  ])

  expect(cid1).toBeTruthy()
})
