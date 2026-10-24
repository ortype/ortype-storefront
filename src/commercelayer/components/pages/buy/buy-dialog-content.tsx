'use client'

import BuyNav from '@/commercelayer/components/pages/buy/buy-nav'
import { DraftGuardDialog } from '@/commercelayer/components/pages/buy/use-draft-guard'
import { DialogCloseTrigger } from '@/components/ui/dialog'
import type { BuyFontsQueryResult } from '@/types'
import { HStack } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

const DynamicBuyContainer = dynamic(
  () => import('@/commercelayer/components/pages/buy/container'),
  { loading: () => <div /> }
)

const DynamicBuy = dynamic(
  () => import('@/commercelayer/components/pages/buy/index'),
  { loading: () => <div /> }
)

export function BuyDialogContent({ data }: { data: BuyFontsQueryResult }) {
  const { font, moreFonts } = data

  return (
    <>
      <DynamicBuyContainer font={font}>
        <DynamicBuy />
      </DynamicBuyContainer>
      <HStack gap={0} position={'absolute'} top={3} left={3}>
        <DialogCloseTrigger
          position={'relative'}
          top={'auto'}
          right={'auto'}
        />
        <BuyNav font={font} moreFonts={moreFonts} />
      </HStack>
      {/* Inside DialogContent so its portalled={false} nesting works */}
      <DraftGuardDialog font={font} />
    </>
  )
}
