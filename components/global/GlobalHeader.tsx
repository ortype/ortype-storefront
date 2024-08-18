// Wrap Header in an "Order" container ?
// The hosted cart just loads an order thats its logical extent
// We have custom handlers for updating lineItem licenses that we need access to
// We also want to use the Customer context in the header for Account
// import Cart from 'components/composite/Cart'
// import CartContainer from 'components/composite/CartContainer'
import { Box, ButtonGroup, Flex, Link as ChakraLink } from '@chakra-ui/react'
import { Account } from 'components/composite/Account'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { CustomerProvider } from '@/components/data/CustomerProvider'
import { SettingsProvider } from '@/components/data/SettingsProvider'
import { CommerceLayer } from '@commercelayer/react-components'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const config = {
  slug: process.env.NEXT_PUBLIC_CL_SLUG,
  selfHostedSlug: process.env.NEXT_PUBLIC_CL_SLUG,
  clientId: process.env.NEXT_PUBLIC_CL_CLIENT_ID,
  endpoint: process.env.NEXT_PUBLIC_CL_ENDPOINT,
  domain: process.env.NEXT_PUBLIC_CL_DOMAIN,
}

const DynamicCartContainer: any = dynamic(
  () => import('components/composite/CartContainer'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)
const DynamicCart: any = dynamic(() => import('components/composite/Cart'), {
  loading: function LoadingSkeleton() {
    return <div />
  },
})

interface Props {
  marketId: string
}

function onUnload() {
  sessionStorage && sessionStorage.removeItem('sessionId')
}

export const GlobalHeader: React.FC<Props> = ({ marketId }) => {
  const pathname = usePathname()

  useEffect(() => {
    sessionStorage &&
      sessionStorage.setItem(
        'sessionId',
        Math.random().toString(36).substr(2, 16)
      )
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])

  const hideHeader =
    pathname?.includes('/book') || pathname?.includes('/studio')

  return (
    !hideHeader && (
      <>
        <Flex justify={'space-between'} p={4}>
          <ChakraLink as={Link} href={'/'}>
            {'Or Type'}
          </ChakraLink>
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
                    <ButtonGroup gap={'2'}>
                      <Account />
                      <DynamicCartContainer settings={settings}>
                        <DynamicCart />
                      </DynamicCartContainer>
                    </ButtonGroup>
                  </CustomerProvider>
                </CommerceLayer>
              )
            }}
          </SettingsProvider>
        </Flex>
      </>
    )
  )
}
