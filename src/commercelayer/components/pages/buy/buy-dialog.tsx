'use client'

import BuyNav from '@/commercelayer/components/pages/buy/buy-nav'
import {
  DraftGuardDialog,
  DraftGuardProvider,
  useDraftGuard,
} from '@/commercelayer/components/pages/buy/use-draft-guard'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import type { BuyFontsQueryResult } from '@/types'
import { HStack } from '@chakra-ui/react'
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

// The guard provider must wrap everything that navigates (close handler,
// BuyNav) AND the BuyProvider that registers the draft, so it lives one level
// above the component that uses `useDraftGuard`.
export function BuyDialog(props: BuyDialogProps) {
  return (
    <DraftGuardProvider>
      <BuyDialogContent {...props} />
    </DraftGuardProvider>
  )
}

function BuyDialogContent({ data }: BuyDialogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { slug, locale } = useParams()
  const { guard } = useDraftGuard()
  const isOpen = /\/buy(\/|$)/.test(pathname)
  const isCartContext = pathname.includes('/cart/')

  const { font, moreFonts } = data ?? {}

  const handleClose = () => {
    const prefix = locale && locale !== 'en' ? `/${locale}` : ''

    // Short-circuited while the draft is dirty: the dialog is controlled by
    // `pathname`, so not navigating simply leaves it open until the user
    // picks Discard / Save in the guard dialog.
    guard(() => {
      if (isCartContext) {
        router.push(`${prefix}/cart`, { scroll: false })
      } else {
        router.push(`${prefix}/fonts/${slug}`, {
          scroll: false,
        })
      }
    })
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
      motionPreset={'slide-in-bottom-custom'}
    >
      <DialogContent
        backdrop={false}
        borderRadius={0}
        // bg={'colorPalette.bg'}
        bg={'colorPalette.50'}
        h={'100vh'}
      >
        <DialogBody overflow={'auto'}>
          <DialogTitle
            textAlign={'center'}
            fontSize={'2rem'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
            ml={{
              base: '1rem',
              xl: '15rem',
              '3xl': '21rem',
            }}
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
            {`buy or shop or purchase`}
          </DialogTitle>
          <DynamicBuyContainer font={font}>
            <DynamicBuy />
          </DynamicBuyContainer>
        </DialogBody>
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
      </DialogContent>
    </DialogRoot>
  )
}

export default BuyDialog
