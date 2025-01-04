'use client'
// Wrap Header in an "Order" container ?
// The hosted cart just loads an order thats its logical extent
// We have custom handlers for updating lineItem licenses that we need access to
// We also want to use the Customer context in the header for Account
// import Cart from 'components/composite/Cart'
// import CartContainer from 'components/composite/CartContainer'
import { useSettings } from '@/components/data/SettingsProvider'
import { Box, ButtonGroup, Link as ChakraLink, Flex } from '@chakra-ui/react'
import { CommerceLayer } from '@commercelayer/react-components'
import { Account } from 'components/composite/Account'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

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

interface Props {}

function onUnload() {
  sessionStorage && sessionStorage.removeItem('sessionId')
}

export const GlobalHeader: React.FC<Props> = ({}) => {
  // const pathname = usePathname()
  const settings = useSettings()
  /*
  useEffect(() => {
    sessionStorage &&
      sessionStorage.setItem(
        'sessionId',
        Math.random().toString(36).substr(2, 16)
      )
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])
*/
  // const hideHeader = pathname?.includes('/book') || pathname?.includes('/studio')
  const hideHeader = false // @TEMP: until we get back around to this

  return (
    !hideHeader && (
      <>
        <Flex justify={'space-between'} p={4}>
          <ChakraLink as={Link} href={'/'} fontSize={'xs'}>
            {'Or Type'}
          </ChakraLink>

          <ButtonGroup gap={'2'}>
            <Account />
            <DynamicCartContainer settings={{ settings }}>
              <DynamicCart />
            </DynamicCartContainer>
          </ButtonGroup>
        </Flex>
      </>
    )
  )
}
