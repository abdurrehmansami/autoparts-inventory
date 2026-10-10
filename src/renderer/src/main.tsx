import './styles/globals.css'
import './i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { App } from './app'

const queryClient = new QueryClient({
  defaultOptions: {
    // Local database: no network, so no background refetching or retries needed.
    queries: { retry: false, refetchOnWindowFocus: false, staleTime: 30_000 }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster richColors position="bottom-center" />
    </QueryClientProvider>
  </StrictMode>
)
