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
  settings: object
}

export const GlobalHeader: React.FC<Props> = ({ settings }) => {
  return (
    <>
      <Flex justify={'space-between'} p={4}>
        <ChakraLink as={Link} href={'/'}>
          {'Or Type'}
        </ChakraLink>
        <ButtonGroup gap={'2'}>
          <Account />
          <DynamicCartContainer settings={settings}>
            <DynamicCart />
          </DynamicCartContainer>
        </ButtonGroup>
      </Flex>
    </>
  )
}
