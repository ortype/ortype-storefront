'use client'
import { Account } from '@/commercelayer/components/composite/Account'
import { Flex, Group, Link } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
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

interface Props {}

export const GlobalHeader: React.FC<Props> = ({}) => {
  return (
    <>
      <SessionId />
      <Flex justify={'space-between'} p={4}>
        <Link asChild fontSize={'xs'}>
          <NextLink href={'/'}>{'Or Type'}</NextLink>
        </Link>

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
