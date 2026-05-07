import { calculateDiscount } from '@/commercelayer/utils/prices'
import type { CompanySize } from '@/sanity/lib/queries'
import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react'
import { SkuOption, type Order } from '@commercelayer/sdk'
import React, { useMemo, useState } from 'react'
import type { FontGroup as FontGroupType } from './typefaces'

interface FontVariant {
  _id: string
  optionName: string
  parentUid: string
}

interface Props {
  name: string
  group: FontGroupType
  unitPrice: number
}

const getMiddleIndex = (array: FontVariant[]): number => {
  return Math.floor(array.length / 2)
}

export const FontGroup: React.FC<Props> = ({ group, name, unitPrice }) => {
  const middleIndex = getMiddleIndex(group.variants)
  const middleVariant = group.variants[middleIndex]
  const className = middleVariant._id

  const groupCount = group.allVariants?.length || 0

  const percentageDiscount = groupCount ? calculateDiscount(groupCount) : 0

  const isLineItem = false
  const [isLoading, setIsLoading] = useState(false)
  // @TODO: implement optimistic UI solution
  const handleClick = async () => {
    setIsLoading(true)
    setIsLoading(false)
  }

  const fullPrice = unitPrice * groupCount
  const totalPrice = Math.round(fullPrice * percentageDiscount)
  console.log({
    groupCount,
    percentageDiscount,
    unitPrice,
    fullPrice,
    totalPrice,
  })

  return (
    <Flex
      justifyContent={'space-between'}
      bg={'brand.50'}
      borderRadius={'1rem'}
      cursor={'pointer'}
      _hover={{
        bg: 'blackAlpha.300',
        '& .toggle-button': {
          borderWidth: '4px',
        },
      }}
      onClick={handleClick}
      transition={'background 300ms ease-in-out'}
      py={4}
      pb={4}
      px={3}
      // mb={1}
    >
      <Stack direction={'row'} gap={2} alignItems={'flex-start'}>
        <Button
          className={'toggle-button'}
          variant={'circle'}
          w={6}
          borderWidth={'2px'}
          h={6}
          minW={6}
          p={0}
          bg={isLineItem ? 'black' : 'white'}
          disabled={isLoading}
          transition={'border-width 200ms ease-in-out'}
        />
        <Stack direction={'column'} gap={2}>
          <Text
            fontSize={'2xl'}
            lineHeight={1}
            as={'div'}
            className={className}
          >
            {name}
          </Text>
          <Text fontSize={'sm'} as={'div'}>
            {`${groupCount} Styles — Variable Font Included`}
          </Text>
        </Stack>
      </Stack>
      <Flex gap={2} alignItems={'center'}>
        {percentageDiscount > 0 && unitPrice !== null && (
          <Stack direction={'column'}>
            <Stack direction={'row'}>
              <Text
                className={'discount'}
                as={'span'}
                fontSize={'xs'}
              >{`${Math.floor(percentageDiscount * 100)}%`}</Text>
              <Text className={'discount'} as={'span'} fontSize={'xs'}>
                {`${totalPrice} EUR`}
              </Text>
            </Stack>
            <Text
              className={'discount'}
              textAlign={'right'}
              as={'span'}
              fontSize={'xs'}
              opacity={0.6}
              textDecorationLine={'line-through'}
            >
              {`${fullPrice} EUR`}
            </Text>
          </Stack>
        )}
      </Flex>
    </Flex>
  )
}
