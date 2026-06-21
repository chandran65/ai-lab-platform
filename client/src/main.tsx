import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      gcTime: 1000 * 60 * 60 * 24, // keep in cache for 24 hours
    },
  },
})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'MINDORA_QUERY_CACHE',
  throttleTime: 1000,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours max age
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
)
