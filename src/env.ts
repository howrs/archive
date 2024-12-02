import "dotenv/config"

if (!process.env.CLIENT_IDS) {
  throw new Error("CLIENT_IDS is not set")
}

export const CLIENT_IDS = process.env.CLIENT_IDS.split(",")
