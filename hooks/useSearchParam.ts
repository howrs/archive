import { useSearchParams } from "next/navigation"

export const useSearchParam = () => {
  const s = decodeURIComponent(useSearchParams().toString().replace("=", ""))

  const url = s.split(":")[0]
  const timestamp = s.split(":")[1]

  return { url, timestamp }
}
