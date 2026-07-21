import type { GroupPriceSummary } from '@/commercelayer/providers/Order/types'
import { Font } from '@/types'
import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'

interface Props {
  font: Font
  summary: GroupPriceSummary
  onToggle: () => void
  hasMultipleGroups?: boolean
}

export const FontFull: React.FC<Props> = ({
  font,
  summary,
  onToggle,
  hasMultipleGroups = false,
}) => {
  const className = font.defaultVariant?._id
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
      cursor={'pointer'}
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
      mb={hasMultipleGroups ? 0.5 : 0}
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
          transition={'border-width 200ms ease-in-out'}
        />
        <Stack direction={'column'} gap={1}>
          <Text
            fontSize={'2xl'}
            lineHeight={1}
            as={'div'}
            className={className}
          >
            {font.shortName + ' ' + 'Full Family'}
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
