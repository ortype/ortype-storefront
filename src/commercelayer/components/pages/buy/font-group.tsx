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
      bg={'blackAlpha.300'}
      borderRadius={'1rem'}
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
          bg={allSelected ? 'black' : 'white'}
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
            {`${styleCount} Styles — Variable Font Included`}
          </Text>
        </Stack>
      </Stack>
      <Flex
        gap={2}
        alignItems={'center'}
        justifyContent={'flex-end'}
        minW={'7rem'}
      >
        {percentageDiscount > 0 && (
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
