import { useSearchParams } from "next/navigation"

export const useSearchParam = () => {
  const s = decodeURIComponent(useSearchParams().toString().replace("=", ""))

  const search = location.href.replace(
    `${location.origin}${location.pathname}?`,
    "",
  )

  const url = search.split(":")[0]
  const timestamp = search.split(":")[1]

  return { url, timestamp, s }
}
