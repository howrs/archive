import { QueryProvider } from "components/QueryProvider"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import type { PropsWithChildren } from "react"

type Props = PropsWithChildren

export const Providers = ({ children }: Props) => {
  return (
    <QueryProvider>
      <NuqsAdapter>{children}</NuqsAdapter>
    </QueryProvider>
  )
}
