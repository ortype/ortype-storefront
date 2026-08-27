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
  open: boolean
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
  open,
  summary,
  onToggle,
}) => {
  const middleIndex = getMiddleIndex(group.variants)
  const middleVariant = group.variants[middleIndex]
  const className = middleVariant._id

  const { styleCount, allSelected, countSelected, percentageDiscount, fullPrice, totalPrice } =
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
      // borderRadius={allSelected ? '0px' : '100px'}
      borderRadius={'full'}
      cursor={allSelected ? 'default' : 'pointer'}
      w={'full'}
      _hover={{
        // borderRadius: '0px',
        bg: '#e3e3e3',
        '& .toggle-button': {
          // bg: 'colorPalette.fg',
          borderWidth: '3px',
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
          <Stack direction={'row'}>
          <Text fontSize={'2xs'} as={'div'} lineHeight={0.75}>
            {`${styleCount} styles — variable font included`}
          </Text>
          {!open && countSelected > 0 && countSelected < styleCount &&
          <Text fontSize={'2xs'} as={'div'} lineHeight={0.75}>
            {`(${countSelected} of ${styleCount} styles selected)`}
          </Text>}
        </Stack>
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
                fontSize={'xs'}
              >{`${percentageDiscount}%`}</Text>
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
