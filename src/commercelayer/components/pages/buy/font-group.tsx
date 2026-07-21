import type { GroupPriceSummary } from '@/commercelayer/providers/Order/types'
import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import type { FontGroup as FontGroupType } from './typefaces'

interface FontVariant {
  _id: string
  optionName: string
  parentUid: string
}

interface Props {
  name: string
  group: FontGroupType
  summary: GroupPriceSummary
  onToggle: () => void
}

const getMiddleIndex = (array: FontVariant[]): number => {
  return Math.floor(array.length / 2)
}

export const FontGroup: React.FC<Props> = ({
  group,
  name,
  summary,
  onToggle,
}) => {
  const middleIndex = getMiddleIndex(group.variants)
  const middleVariant = group.variants[middleIndex]
  const className = middleVariant._id

  const { styleCount, allSelected, percentageDiscount, fullPrice, totalPrice } =
    summary

  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    onToggle()
    setIsLoading(false)
  }

  return (
    <Flex
      justifyContent={'space-between'}
      bg={allSelected ? 'colorPalette.bg' : 'brand.50'}
      boxShadow={allSelected ? 'inset 0 0 0 2px #000' : 'inset 0 0 0 0px #000'}
      borderRadius={allSelected ? '100px' : '0px'}
      cursor={allSelected ? 'default' : 'pointer'}
      w={'full'}
      _hover={{
        borderRadius: '100px',
        '& .toggle-button': {
          bg: 'colorPalette.fg',
        },
      }}
      onClick={handleClick}
      transition={
        'border-radius 200ms ease-in-out, box-shadow 200ms ease-in-out, background 200ms ease-in-out'
      }
      py={3}
      px={4}
    >
      <Stack direction={'row'} gap={3} alignItems={'center'}>
        <Button
          className={'toggle-button'}
          variant={'circle'}
          w={'1.385rem'}
          borderWidth={'2px'}
          h={'1.385rem'}
          minW={'1.385rem'}
          p={0}
          bg={allSelected ? 'black' : 'white'}
          disabled={isLoading}
          transition={
            'border-radius 200ms ease-in-out, border-width 200ms ease-in-out'
          }
        />
        <Stack direction={'column'} gap={1}>
          <Text
            fontSize={'2xl'}
            lineHeight={1}
            as={'div'}
            className={className}
          >
            {name}
          </Text>
          <Text fontSize={'2xs'} as={'div'} lineHeight={0.75}>
            {`${styleCount} Styles — Variable Font Included`}
          </Text>
        </Stack>
      </Stack>
      <Flex
        gap={2}
        alignItems={'center'}
        justifyContent={'flex-end'}
        minW={'7rem'}
        lineHeight={1}
      >
        {percentageDiscount > 0 && (
          <Stack direction={'column'} gap={1}>
            <Stack direction={'row'}>
              <Text
                className={'discount'}
                as={'span'}
                fontSize={'2xs'}
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
