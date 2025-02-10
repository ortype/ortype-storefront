'use client'
import { Account } from '@/commercelayer/components/composite/Account'
import { Flex, Group, Link } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { Font } from 'sanity.types'
import { Nav } from './Nav'
import { SessionId } from './SessionId'

const DynamicCartContainer: any = dynamic(
  () => import('@/components/composite/CartContainer'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)
const DynamicCart: any = dynamic(() => import('@/components/composite/Cart'), {
  loading: function LoadingSkeleton() {
    return <div />
  },
})

interface Props {
  fonts: Font[]
}

export const GlobalHeader: React.FC<Props> = ({ fonts }) => {
  return (
    <>
      <SessionId />
      <Flex justify={'space-between'} p={4} pos={'fixed'} left={0} w={'100%'}>
        <Nav fonts={fonts} />

        <Group gap={'2'}>
          <Account />
          <DynamicCartContainer>
            <DynamicCart />
          </DynamicCartContainer>
        </Group>
      </Flex>
    </>
  )
}
