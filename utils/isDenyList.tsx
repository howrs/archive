const denyList = ["ogs.google.com"]

export const isDenyList = (path: string) => {
  return denyList.includes(path)
}
