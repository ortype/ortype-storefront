import { usePriceLocaleContext } from '@/commercelayer/providers/price-locale'
import { formatPrice } from '@/commercelayer/utils/prices'
import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react'
import React, { startTransition, useOptimistic } from 'react'

interface Props {
  name: string
  skuCode: string
  className?: string
  isSelected: boolean
  /** When true, the style belongs to a fully selected group and cannot be toggled individually */
  allSelected?: boolean
  unitPriceCents: number
  nextUnitPriceCents: number
  onToggle: () => void
}

export const SingleStyles: React.FC<Props> = ({
  name,
  skuCode,
  className,
  isSelected,
  allSelected = false,
  unitPriceCents,
  nextUnitPriceCents,
  onToggle,
}) => {
  const priceLocale = usePriceLocaleContext()

  // The selection lives in the order reducer, so committing it re-renders
  // every style row (and every order-context consumer). Running that inside a
  // transition keeps the click handler cheap and the render interruptible,
  // while `useOptimistic` lets *this row* repaint its selected chrome
  // immediately. The optimistic value is discarded once the transition
  // commits and `isSelected` arrives with the same value from props.
  const [optimisticSelected, setOptimisticSelected] = useOptimistic(isSelected)

  const handleClick = () => {
    if (allSelected) return
    startTransition(() => {
      setOptimisticSelected(!optimisticSelected)
      onToggle()
    })
  }

  return (
    <Flex
      justifyContent={'space-between'}
      bg={'colorPalette.bg'}
      boxShadow={
        optimisticSelected ? 'inset 0 0 0 2px #000' : 'inset 0 0 0 0px #000'
      }
      borderRadius={optimisticSelected ? '100px' : '0px'}
      _hover={
        allSelected
          ? {}
          : {
              bg: '#f4f4f4',
              borderRadius: '100px',
              '& .toggle-button': {
                borderWidth: '3px',
              },
            }
      }
      onClick={handleClick}
      transition={
        'border-radius 200ms ease-in-out, box-shadow 200ms ease-in-out, background 200ms ease-in-out'
      }
      cursor={'pointer'}
      py={2}
      px={4}
      ml={allSelected ? 9 : 0}
      minH={'2.5rem'}
    >
      <Stack direction={'row'} gap={3} alignItems={'center'}>
        <Button
          className={'toggle-button'}
          variant={'circle'}
          display={allSelected ? 'none' : 'block'}
          w={'1.385rem'}
          borderWidth={'2px'}
          h={'1.385rem'}
          minW={'1.385rem'}
          p={0}
          bg={optimisticSelected ? 'black' : 'white'}
          transition={'border-width 200ms ease-in-out'}
        />
        <Text
          fontSize={'xl'}
          lineHeight={1}
          as={'span'}
          className={className}
        >
          {name}
        </Text>
      </Stack>
      <Flex
        gap={2}
        alignItems={'center'}
        justifyContent={'flex-end'}
        minW={'7rem'}
      >
        {!isSelected && nextUnitPriceCents < unitPriceCents && (
          <Text
            className={'discount'}
            as={'span'}
            fontSize={'xs'}
            opacity={0.6}
            textDecorationLine={'line-through'}
          >
            {formatPrice(unitPriceCents, priceLocale)}
          </Text>
        )}
        {isSelected ? (
          <Text as={'span'} fontSize={'xs'} opacity={0.6}>
            {formatPrice(unitPriceCents, priceLocale)} EUR
          </Text>
        ) : (
          <Text as={'span'} fontSize={'xs'}>
            {formatPrice(nextUnitPriceCents, priceLocale)} EUR
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
