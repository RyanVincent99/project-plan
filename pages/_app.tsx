// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { ChannelProvider } from '@/contexts/ChannelContext'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <WorkspaceProvider>
        <ChannelProvider>
          <Component {...pageProps} />
        </ChannelProvider>
      </WorkspaceProvider>
    </SessionProvider>
  )
}