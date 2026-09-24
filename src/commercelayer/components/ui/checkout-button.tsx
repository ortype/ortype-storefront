import { useOrderContext } from '@/commercelayer/providers/Order'
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
  const { commitSelections, isFullyCommitted } = useOrderContext()
  const router = useRouter()
  const [isCommitting, setIsCommitting] = useState(false)

  const handleCheckout = async () => {
    // Fast path: all groups already committed and clean
    if (isFullyCommitted) {
      router.push(href || `/checkout/${orderId}`)
      return
    }

    setIsCommitting(true)
    try {
      const result = await commitSelections()
      if (result.success) {
        router.push(href || `/checkout/${orderId}`)
      } else {
        console.error(
          '[CheckoutButton] commitSelections failed:',
          result.error
        )
        setIsCommitting(false)
      }
    } catch (error) {
      console.error('[CheckoutButton] commitSelections error:', error)
      setIsCommitting(false)
    }
  }

  return (
    <Stack
      justifyContent={'flex-end'}
      gap={2}
      direction={{ base: 'row', sm: 'column' }}
      w={'full'}
    >
      <Button
        variant={'outline'}
        bg={'white'}
        borderRadius={'5rem'}
        size={'sm'}
        fontSize={'md'}
        w={'full'}
        _hover={{
          bg: 'black',
          color: 'white',
        }}
      >
        {'Share cart'}
      </Button>
      <Button
        variant={'outline'}
        bg={'white'}
        borderRadius={'5rem'}
        size={'sm'}
        fontSize={'md'}
        w={'full'}
        _hover={{
          bg: 'black',
          color: 'white',
        }}
      >
        {'Save as PDF'}
      </Button>
      <Button
        variant={'outline'}
        bg={'black'}
        borderRadius={'5rem'}
        size={'sm'}
        fontSize={'md'}
        color={'white'}
        _hover={{
          bg: 'white',
          color: 'black',
        }}
        disabled={isDisabled || isCommitting}
        gap={1}
        onClick={handleCheckout}
      >
        {isCommitting ? (
          <>
            <Spinner size={'xs'} /> {'Preparing order...'}
          </>
        ) : (
          <>
            <LockIcon /> {label || 'Proceed to Checkout'}
          </>
        )}
      </Button>
    </Stack>
  )
}
