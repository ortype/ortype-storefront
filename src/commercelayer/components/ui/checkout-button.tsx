import { LockIcon } from '@sanity/icons'
import {
  Box,
  Button,
  Center,
  Container,
  Fieldset,
  Flex,
  Show,
  SimpleGrid,
  Spinner,
  Stack,
  HStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

export const CheckoutButton = ({ isDisabled, order }) => {
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
        <Link href={`/checkout/${order?.id}`}>
          <LockIcon /> {'Proceed to Checkout'}
        </Link>
      </Button>
    </Flex>
  )
}
