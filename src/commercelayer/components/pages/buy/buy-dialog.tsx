'use client'

import BuyNav from '@/commercelayer/components/pages/buy/buy-nav'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import type { BuyFontsQueryResult } from '@/types'
import { Box, Heading, HStack } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { useParams, usePathname, useRouter } from 'next/navigation'

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

export interface BuyDialogProps {
  data: BuyFontsQueryResult | null
}

export function BuyDialog({ data }: BuyDialogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { slug, locale } = useParams()
  const isOpen = pathname.endsWith('/buy')

  const { font, moreFonts } = data ?? {}

  const handleClose = () => {
    const prefix = locale && locale !== 'en' ? `/${locale}` : ''
    router.push(`${prefix}/fonts/${slug}`, { scroll: false })
  }

  return (
    <DialogRoot
      lazyMount
      unmountOnExit
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) handleClose()
      }}
      size={'full'}
      motionPreset={'slide-in-bottom'}
    >
      <DialogContent borderRadius={0} bg={'colorPalette.bg'} h={'100vh'}>
        <DialogBody overflow={'auto'}>
          <HStack gap={0} position={'absolute'} top={3} left={3}>
            <DialogCloseTrigger
              position={'relative'}
              top={'auto'}
              right={'auto'}
            />
            <BuyNav font={font} moreFonts={moreFonts} />
          </HStack>
          <DialogTitle
            textAlign={'center'}
            fontSize={'2rem'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
            ml={{ base: '1rem', xl: '15rem', '3xl': '21rem' }}
            mr={{
              base: '1rem',
              lg: '15rem',
              xl: '15rem',
              '2xl': '17rem',
              '3xl': '21rem',
            }}
            pb={8}
            my={4}
            lineHeight={1}
          >
            {`you or me or they are buying fonts`}
          </DialogTitle>
          <DynamicBuyContainer font={font}>
            <DynamicBuy />
          </DynamicBuyContainer>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}

export default BuyDialog
