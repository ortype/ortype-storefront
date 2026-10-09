'use client'

import { useCartContext } from '@/commercelayer/providers/cart'
import { useOrderContext } from '@/commercelayer/providers/order'
import { countSelections } from '@/commercelayer/providers/order/utils/selection-utils'
import type { ClonePayload } from '@/commercelayer/utils/cart-share'
import { toaster } from '@/components/ui/toaster'
import { Box, Button, Center, Spinner, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// @NOTE: deprecated
// import ReplaceCartDialog from './replace-cart-dialog'

interface CartCloneHandlerProps {
  /** Resolved shared cart. Missing when the link is invalid / out of date. */
  payload?: ClonePayload
  /** Shown instead of cloning when there is no usable payload */
  invalidMessage?: string
}

type Phase = 'undecided' | 'importing' | 'error'

const FullScreen = ({ children }: { children: React.ReactNode }) => (
  <Box pos='fixed' inset='0' bg='bg/80'>
    <Center h='full'>{children}</Center>
  </Box>
)

const CartCloneHandler = ({
  payload,
  invalidMessage,
}: CartCloneHandlerProps) => {
  const router = useRouter()
  const { isLoading, skuOptions, importSelections } = useCartContext()
  // The saved cart (not the draft-applied one): the import discards unsaved edits
  const { itemsCount } = useOrderContext()

  const [phase, setPhase] = useState<Phase>('undecided')
  const [error, setError] = useState<string>()
  // Guards against the StrictMode double effect (and re-renders) so the clone
  // only ever starts once.
  const startedRef = useRef(false)

  const isReady = !isLoading && !!skuOptions && skuOptions.length > 0
  // A recipient who already has a cart must confirm before it is replaced
  const showConfirm =
    !!payload && isReady && phase === 'undecided' && itemsCount > 0

  const sharedItemsCount = useMemo(
    () => (payload ? countSelections(payload.selections) : 0),
    [payload]
  )

  const goToCart = useCallback(() => router.replace('/cart'), [router])

  const runImport = useCallback(async () => {
    if (!payload) return
    setPhase('importing')
    const result = await importSelections(payload)
    if (!result.success) {
      setError(result.error?.message ?? 'Something went wrong')
      setPhase('error')
      return
    }
    if (payload.skippedFonts.length > 0) {
      toaster.create({
        type: 'warning',
        title: 'Some fonts could not be added',
        description: `${payload.skippedFonts.join(
          ', '
        )} changed since this cart was shared and was skipped.`,
      })
    }
    goToCart()
  }, [payload, importSelections, goToCart])

  // Empty cart: nothing to confirm, clone straight away
  /*
  useEffect(() => {
    if (!payload || !isReady || itemsCount > 0 || startedRef.current) return
    startedRef.current = true
    void runImport()
  }, [payload, isReady, itemsCount, runImport])
  */

  /*
  const cartHasItemsMsg = `You already have ${itemsCount} ${
    itemsCount === 1 ? 'style' : 'styles'
  } in your cart. Replacing it with the shared cart (${sharedItemsCount} ${
    sharedItemsCount === 1 ? 'style' : 'styles'
  }) will remove your current selections.`
  */

  if (!payload) {
    return (
      <FullScreen>
        <VStack gap={6} px={6} textAlign='center'>
          <Text fontSize='2xl'>
            {invalidMessage ?? 'This shared cart link is not valid'}
          </Text>
          <Button
            onClick={() => router.push('/')}
            variant='outline'
            bg='white'
            borderRadius='5rem'
            size='sm'
            fontSize='md'
          >
            {'Continue shopping'}
          </Button>
        </VStack>
      </FullScreen>
    )
  }

  if (phase === 'error') {
    return (
      <FullScreen>
        <VStack gap={6} px={6} textAlign='center'>
          <Text fontSize='2xl'>{'We could not copy this cart'}</Text>
          {error && (
            <Text textStyle='sm' role='alert'>
              {error}
            </Text>
          )}
          <Button
            onClick={goToCart}
            variant='outline'
            bg='white'
            borderRadius='5rem'
            size='sm'
            fontSize='md'
          >
            {'Go to my cart'}
          </Button>
        </VStack>
      </FullScreen>
    )
  }

  return (
    <Box pos='fixed' inset='0' bg='bg/80'>
      <Center h='full'>
        <VStack gap={6} maxW={'30rem'}>
          <Text textAlign={'center'} fontSize={'2xl'} lineHeight={1.2}>
            {`Someone just shared this cart with you. You can now review and edit the content of the cart, checkout and pay.`}
          </Text>
          {/*<Text textAlign={'center'} fontSize={'sm'} lineHeight={1.2}>
            {itemsCount > 0 && cartHasItemsMsg}
          </Text>*/}

          <Button
            onClick={() => void runImport()}
            variant={'solid'}
            bg={'black'}
            color={'white'}
            borderRadius={'5rem'}
            border={'2px solid #000'}
            size={'md'}
            fontSize={'lg'}
            _hover={{
              bg: 'transparent',
              color: 'colorPalette.fg',
            }}
          >
            {phase === 'importing' ? (
              <>
                <Spinner size={'xs'} /> {'Processing...'}
              </>
            ) : (
              'Open cart'
            )}
          </Button>
        </VStack>
      </Center>
    </Box>
  )
}

export default CartCloneHandler
