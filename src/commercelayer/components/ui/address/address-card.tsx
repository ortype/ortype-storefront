import {
  getCountryName,
  getStateName,
} from '@/commercelayer/utils/country-utils'
import { Box, Text, VStack, type BoxProps } from '@chakra-ui/react'
import type { Address } from '@commercelayer/sdk'
import type { ReactNode } from 'react'

interface Props extends BoxProps {
  address: Address
  actions?: ReactNode
}

export const AddressCard = ({ address, actions, ...props }: Props) => (
  <Box
    bg={'brand.50'}
    p={4}
    fontSize={'md'}
    lineHeight={1.2}
    pos={'relative'}
    {...props}
  >
    <VStack align='start' gap={0}>
      {address.company && <Text>{address.company}</Text>}
      <Text>
        {address.full_name ||
          [address.first_name, address.last_name].filter(Boolean).join(' ')}
      </Text>
      <Text>
        {address.line_1}
        {address.line_2 && `, ${address.line_2}`}
      </Text>
      <Text>
        {address.zip_code}
        {`, ${address.city}`}
      </Text>
      <Text>
        {getStateName(address.country_code, address.state_code)}
        {`, ${getCountryName(address.country_code)}`}
      </Text>
      {address.billing_info && <Text mt={1}>{address.billing_info}</Text>}
    </VStack>
    {actions}
  </Box>
)
