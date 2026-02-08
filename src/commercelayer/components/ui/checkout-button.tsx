import { Button, Flex, HStack } from '@chakra-ui/react'
import { LockIcon } from '@sanity/icons'
import Link from 'next/link'
import React from 'react'

interface Props {
  isDisabled: boolean
  orderId: string
  label?: string
  href?: string
}

export const CheckoutButton = ({ isDisabled, orderId, label, href }) => {
  return (
    <Flex justifyContent={'space-between'} alignItems={'start'} w={'full'}>
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
      </HStack>
      <Button
        asChild
        variant={'solid'}
        bg={'red'}
        borderRadius={'5rem'}
        size={'sm'}
        color={'white'}
        disabled={isDisabled}
        gap={1}
      >
        <Link href={href || `/checkout/${orderId}`}>
          <LockIcon /> {label || 'Proceed to Checkout'}
        </Link>
      </Button>
    </Flex>
  )
}
