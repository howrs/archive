import { readdir, unlink } from "node:fs/promises"
import { join } from "node:path"

async function findAndRemoveDSStore(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const path = join(dir, entry.name)

    if (entry.isDirectory()) {
      await findAndRemoveDSStore(path)
    } else if (entry.name === ".DS_Store") {
      await unlink(path)
      console.log(`Removed: ${path}`)
    }
  }
}

async function main() {
  await findAndRemoveDSStore("./archive")
}

main()
