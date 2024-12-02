export const archive = async (url: string) => {
  return fetch(`https://chrome-api.archive.org/save`, {
    method: "POST",
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      capture_all: "1",
      url,
    }),
  })
    .then(async (r) => {
      const t = await r.text()
      return t
    })
    .catch((e) => {
      console.error("Error archive machine: ", url)
      console.error(e)
    })
}
