import { useOrderContext } from '@/commercelayer/providers/Order'
import { Button, Flex, HStack, Spinner } from '@chakra-ui/react'
import { LockIcon } from '@sanity/icons'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface Props {
  isDisabled: boolean
  orderId: string
  label?: string
  href?: string
}

export const CheckoutButton = ({ isDisabled, orderId, label, href }) => {
  const { commitSelections } = useOrderContext()
  const router = useRouter()
  const [isCommitting, setIsCommitting] = useState(false)

  const handleCheckout = async () => {
    setIsCommitting(true)
    try {
      const result = await commitSelections()
      if (result.success) {
        router.push(href || `/checkout/${orderId}`)
      } else {
        console.error('[CheckoutButton] commitSelections failed:', result.error)
        setIsCommitting(false)
      }
    } catch (error) {
      console.error('[CheckoutButton] commitSelections error:', error)
      setIsCommitting(false)
    }
  }

  return (
    <Flex justifyContent={'flex-end'} alignItems={'center'} w={'full'}>
      <HStack gap={2}>
        <Button
          variant={'outline'}
          bg={'white'}
          borderRadius={'5rem'}
          size={'sm'}
          fontSize={'md'}
        >
          {'Share cart'}
        </Button>
        <Button
          variant={'outline'}
          bg={'white'}
          borderRadius={'5rem'}
          size={'sm'}
          fontSize={'md'}
        >
          {'Save as PDF'}
        </Button>
        <Button
          variant={'solid'}
          bg={'black'}
          borderRadius={'5rem'}
          size={'sm'}
          fontSize={'md'}
          color={'white'}
          disabled={isDisabled || isCommitting}
          gap={1}
          onClick={handleCheckout}
        >
          {isCommitting ? (
            <><Spinner size={'xs'} /> {'Preparing order...'}</>
          ) : (
            <><LockIcon /> {label || 'Proceed to Checkout'}</>
          )}
        </Button>
      </HStack>
    </Flex>
  )
}
