import type { GroupPriceSummary } from '@/commercelayer/providers/Order/types'
import { usePriceLocaleContext } from '@/commercelayer/providers/price-locale'
import { formatPrice } from '@/commercelayer/utils/prices'
import { Font } from '@/types'
import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import React, { startTransition, useOptimistic } from 'react'
import TogglePieButton from './toggle-pie-button'

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
  const {
    styleCount,
    allSelected,
    countSelected,
    percentageDiscount,
    fullPriceCents,
    totalPriceCents,
  } = summary

  const priceLocale = usePriceLocaleContext()

  // See SingleStyles: commit the (expensive) selection update in a transition
  // and repaint this header's selected chrome optimistically.
  const [optimisticAllSelected, setOptimisticAllSelected] =
    useOptimistic(allSelected)
  // The pie fill needs the count, not just the all/nothing flag, so that
  // individual style toggles inside an expanded group move it too.
  const [optimisticCountSelected, setOptimisticCountSelected] =
    useOptimistic(countSelected)

  const selectedRatio =
    styleCount > 0 ? optimisticCountSelected / styleCount : 0

  const handleClick = () => {
    startTransition(() => {
      setOptimisticAllSelected(!optimisticAllSelected)
      setOptimisticCountSelected(optimisticAllSelected ? 0 : styleCount)
      onToggle()
    })
  }

  return (
    <Flex
      justifyContent={'space-between'}
      bg={'colorPalette.bg'}
      boxShadow={
        optimisticAllSelected
          ? 'inset 0 0 0 2px #000'
          : 'inset 0 0 0 0px #000'
      }
      borderRadius={'full'}
      cursor={'pointer'}
      _hover={{
        bg: '#f4f4f4',
        '& .toggle-button': {
          borderWidth: '3px',
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
        <TogglePieButton
          className={'toggle-button'}
          value={selectedRatio}
          aria-label={`${optimisticCountSelected} of ${styleCount} styles selected`}
          w={'1.385rem'}
          borderWidth={'2px'}
          h={'1.385rem'}
          minW={'1.385rem'}
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
            {font.shortName + ' ' + 'Full Family'}
          </Text>
          <Text fontSize={'2xs'} as={'div'} lineHeight={0.75}>
            {`${styleCount} styles — variable font included`}
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
              >{`${percentageDiscount}%`}</Text>
              <Text className={'discount'} as={'span'} fontSize={'xs'}>
                {formatPrice(totalPriceCents, priceLocale)} EUR
              </Text>
            </Stack>
            <Box textAlign={'right'}>
              <Text
                className={'discount'}
                textAlign={'right'}
                as={'span'}
                fontSize={'xs'}
                opacity={0.6}
                textDecorationLine={'line-through'}
              >
                {formatPrice(fullPriceCents, priceLocale)}
              </Text>
              <Text
                as={'span'}
                textDecorationLine={'none'}
                opacity={0.6}
                fontSize={'xs'}
              >
                {' EUR'}
              </Text>
            </Box>
          </Stack>
        )}
      </Flex>
    </Flex>
  )
}
