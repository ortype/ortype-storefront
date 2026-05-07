import { calculateDiscount } from '@/commercelayer/utils/prices'
import { Font } from '@/types'
import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'

interface FontVariant {
  _id: string
  optionName: string
  parentUid: string
}

interface Props {
  font: Font
  unitPrice: number
}

const getMiddleIndex = (array: FontVariant[]): number => {
  return Math.floor(array.length / 2)
}

export const FontFull: React.FC<Props> = ({ font, unitPrice }) => {
  const className = font.defaultVariant?._id
  const fontCount = font.variants?.length

  const percentageDiscount = fontCount ? calculateDiscount(fontCount) : 0

  const isLineItem = false
  const [isLoading, setIsLoading] = useState(false)
  // @TODO: implement optimistic UI solution
  const handleClick = async () => {
    setIsLoading(true)
    setIsLoading(false)
  }

  const fullPrice = unitPrice * fontCount
  const totalPrice = Math.round(fullPrice * percentageDiscount)
  console.log({
    fontCount,
    percentageDiscount,
    unitPrice,
    fullPrice,
    totalPrice,
  })

  return (
    <Flex
      justifyContent={'space-between'}
      bg={'white'}
      borderRadius={'1rem'}
      border={'2px solid black'}
      cursor={'pointer'}
      _hover={{
        bg: 'brand.50',
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
            {font.name}
          </Text>
          <Text fontSize={'sm'} as={'div'}>
            {`${fontCount} Styles — Variable Font Included`}
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
