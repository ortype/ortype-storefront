'use client'
import { CustomerProvider } from '@/components/data/CustomerProvider'
import { SettingsProvider } from '@/components/data/SettingsProvider'
import { CommerceLayer } from '@commercelayer/react-components'

const config = {
  slug: process.env.NEXT_PUBLIC_CL_SLUG,
  selfHostedSlug: process.env.NEXT_PUBLIC_CL_SLUG,
  clientId: process.env.NEXT_PUBLIC_CL_CLIENT_ID,
  endpoint: process.env.NEXT_PUBLIC_CL_ENDPOINT,
  domain: process.env.NEXT_PUBLIC_CL_DOMAIN,
}

function Providers({
  marketId,
  children,
}: {
  marketId: string | null
  children: React.ReactNode
}) {
  return (
    <>
      <SettingsProvider config={{ ...config, marketId }}>
        {({ settings, isLoading }) => {
          return isLoading ? (
            <div>{'Loading...'}</div>
          ) : !settings.isValid ? (
            <div>{'Invalid settings config'}</div>
          ) : (
            <CommerceLayer
              accessToken={settings.accessToken}
              endpoint={config.endpoint}
            >
              <CustomerProvider
                customerId={settings.customerId}
                accessToken={settings.accessToken}
                domain={config.endpoint}
                {...config}
              >
                {children}
              </CustomerProvider>
            </CommerceLayer>
          )
        }}
      </SettingsProvider>
    </>
  )
}

export default Providers
