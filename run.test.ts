import { test, expect } from "@playwright/test";
import { readFile, writeFile, mkdir, rename } from "fs/promises";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { chromium } from "playwright-extra";
import { bytesToHex } from "@noble/hashes/utils";
import { sha256 } from "@noble/hashes/sha256";
import { saveToIPFS } from "./src/saveToIPFS";
import { getIPFSURL } from "./src/getIPFSURL";
import { toBlob, textToBlob } from "undio";
import { filesize } from "filesize";
import { $ } from "zx";

const viewport = {
  width: 1920,
  height: 1080,
};

test.use({
  colorScheme: "dark",
  viewport,
});

test("archive", async () => {
  chromium.use(StealthPlugin());

  const browser = await chromium.launch({
    headless: false,
    devtools: false,
    timeout: 100_000_000,
  });

  const page = await browser.newPage();

  const url = await readFile("./url", "utf8");

  console.log({ url });

  const timestamp = Date.now();
  await page.goto(`https://${url}`);

  // save entire page
  await Promise.all([
    page.waitForLoadState("load", { timeout: 20000 }),
    // page.waitForLoadState("domcontentloaded", { timeout: 20000 }),
  ]);

  // wait few secs
  await page.waitForTimeout(3000);

  // dump dome
  const dom = await page.content();
  await writeFile(`./temp/index-1.html`, dom);

  await $`cat temp/index-1.html | monolith - -MIjva -b https://${url} -o temp/index.html`;

  await $`rm temp/index-1.html`;

  // wait for the page to load
  const hash = bytesToHex(sha256(url));
  const path = `./archive/${hash}/${timestamp}`;

  // create directory
  await mkdir(path, { recursive: true });

  console.log("read file...");

  const [html, buffer] = await Promise.all([
    readFile(`./temp/index.html`, "utf8"),
    page.screenshot({ path: `${path}/screenshot.png`, fullPage: true }),
  ]);

  await browser.close();

  const htmlBlob = textToBlob(html);

  const fileSize = filesize(htmlBlob.size);

  console.log(`Done! File size: ${fileSize} bytes`);

  await rename(`./temp/index.html`, `${path}/index.html`);

  const [cid1, cid2] = await Promise.all([
    saveToIPFS({ body: htmlBlob }),
    saveToIPFS({ body: toBlob(buffer) }),
  ]);

  console.log(getIPFSURL(cid1));
  console.log(getIPFSURL(cid2));
});
