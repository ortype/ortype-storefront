import { InfoTip } from '@/components/ui/toggle-tip'
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

export const FieldsetLegend = ({ children }) => {
  return (
    <Fieldset.Legend
      px={3}
      fontSize={'xs'}
      textTransform={'uppercase'}
      fontVariantNumeric={'tabular-nums'}
      color={'#737373'}
      asChild
    >
      <Flex gap={1} alignItems={'center'}>
        {children}
        <InfoTip
          content={'This is additional information about this fieldset'}
        />
      </Flex>
    </Fieldset.Legend>
  )
}
