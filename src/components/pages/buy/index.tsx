'use client'
import { BuyProvider } from '@/commercelayer/providers/Buy'
import type { BuyFontsQueryResult, FontPagePayload } from '@/types'
import { Container, Heading } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import BuyNav from './buy-nav'

export interface BuyPageProps {
  data: BuyFontsQueryResult | null
}

const DynamicBuy: any = dynamic(
  () => import('@/components/pages/buy/composite'),
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
      <BuyProvider font={font}>
        <DynamicBuy />
      </BuyProvider>
    </Container>
  )
}

export default BuyPage
