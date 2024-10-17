"use client"

import { useIsClient } from "@uidotdev/usehooks"
import type { PropsWithChildren } from "react"

type Props = PropsWithChildren

export const OnlyClient = ({ children }: Props) => {
  const isClient = useIsClient()

  if (!isClient) {
    return <></>
  }

  return <>{children}</>
}
