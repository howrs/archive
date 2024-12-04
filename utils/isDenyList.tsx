const denyList = ["ogs.google.com"]

export const isDenyList = (host: string) => {
  return denyList.includes(host)
}
