'use client'
import type { BuyFontsQueryResult, FontPagePayload } from '@/types'
import { Container, Heading } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import BuyNav from '@/commercelayer/components/pages/buy/buy-nav'

export interface BuyPageProps {
  data: BuyFontsQueryResult | null
}

const DynamicBuyContainer: any = dynamic(
  () => import('@/commercelayer/components/pages/buy/container'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

const DynamicBuy: any = dynamic(
  () => import('@/commercelayer/components/pages/buy/index'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

export function BuyPage({ data }: BuyPageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { font, moreFonts } = data ?? {}

  return (
    <Container my={6}>
      <Heading
        textAlign={'center'}
        fontSize={'2rem'}
        fontWeight={'normal'}
        textTransform={'uppercase'}
        mx={'auto'}
        pb={8}
      >
        {`you or me or they are buying `}
        <BuyNav font={font} moreFonts={moreFonts} />
      </Heading>
      <DynamicBuyContainer font={font}>
        <DynamicBuy />
      </DynamicBuyContainer>
    </Container>
  )
}

export default BuyPage
