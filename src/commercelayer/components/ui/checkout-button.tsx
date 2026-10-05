import { useOrderContext } from '@/commercelayer/providers/Order'
import { toaster } from '@/components/ui/toaster'
import {
  Button,
  Flex,
  HStack,
  Spinner,
  Stack,
  VStack,
} from '@chakra-ui/react'
import { LockIcon } from '@sanity/icons'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface Props {
  isDisabled: boolean
  orderId: string
  label?: string
  href?: string
}

export const CheckoutButton: React.FC<Props> = ({
  isDisabled,
  orderId,
  label,
  href,
}) => {
  const { flushPendingWrites, repriceAll, isFullyCommitted } =
    useOrderContext()
  const router = useRouter()
  const [isCommitting, setIsCommitting] = useState(false)

  // The order already holds the cart (cart edits write through as they are
  // made), so there is nothing to reconcile here. We only wait for in-flight
  // writes to settle and make sure no font is priced at a stale license size.
  const handleCheckout = async () => {
    // Fast path: nothing pending and nothing stale
    if (isFullyCommitted) {
      router.push(href || `/checkout/${orderId}`)
      return
    }

    setIsCommitting(true)
    try {
      await flushPendingWrites()
      const result = await repriceAll()
      if (result.success) {
        router.push(href || `/checkout/${orderId}`)
      } else {
        console.error('[CheckoutButton] repriceAll failed:', result.error)
        toaster.create({
          type: 'error',
          title: 'Your order could not be prepared',
          description: result.error?.message,
        })
        setIsCommitting(false)
      }
    } catch (error) {
      console.error('[CheckoutButton] checkout preparation error:', error)
      setIsCommitting(false)
    }
  }

  return (
    <Button
      variant={'outline'}
      bg={'colorPalette.fg'}
      color={'colorPalette.bg'}
      borderRadius={'5rem'}
      size={'md'}
      fontSize={'lg'}
      w={'full'}
      css={{
        _hover: {
          bg: 'transparent',
          color: 'colorPalette.fg',
        },
      }}
      gap={1}
      disabled={isDisabled || isCommitting}
      onClick={handleCheckout}
    >
      {isCommitting ? (
        <>
          <Spinner size={'xs'} /> {'Preparing order...'}
        </>
      ) : (
        <>
          <LockIcon /> {label || 'Checkout  →'}
        </>
      )}
    </Button>
  )
}
