import { ReactNode } from 'react'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  // TODO: Add context providers here (e.g., Router, QueryClientProvider, Redux Provider, ThemeProvider).
  return <>{children}</>
}

