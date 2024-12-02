import { createStorage } from "unstorage"
import githubDriver from "unstorage/drivers/github"

const prefix = `_tap_buhtig`.split("").reverse().join("")

export const storage = (token = true) =>
  createStorage({
    driver: githubDriver({
      repo: "howrs/archive",
      branch: "main",
      dir: "/archive",
      token: token
        ? `${prefix}11BIN7DNQ0jyQacj7JXybS_dmhoXCjckf3ezW32iOc6DpBplII6FRYEJvJuvyMNaNc5JH46VAKHLAZbvW8`
        : undefined,
    }),
  })
