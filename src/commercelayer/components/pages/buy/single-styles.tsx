import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'

interface Props {
  name: string
  skuCode: string
  className?: string
  isSelected: boolean
  /** When true, the style belongs to a fully selected group and cannot be toggled individually */
  disabled?: boolean
  unitPrice: number
  nextUnitPrice: number
  onToggle: () => void
}

export const SingleStyles: React.FC<Props> = ({
  name,
  skuCode,
  className,
  isSelected,
  disabled = false,
  unitPrice,
  nextUnitPrice,
  onToggle,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    if (disabled) return
    setIsLoading(true)
    onToggle()
    setIsLoading(false)
  }

  return (
    <Flex
      justifyContent={'space-between'}
      // bg={isSelected ? 'blackAlpha.300' : 'brand.50'}
      bg={isSelected ? 'colorPalette.bg' : 'brand.50'}
      boxShadow={isSelected ? 'inset 0 0 0 2px #000' : 'inset 0 0 0 0px #000'}
      borderRadius={isSelected ? '100px' : '0px'}
      cursor={disabled ? 'default' : 'pointer'}
      opacity={disabled ? 0.6 : 1}
      _hover={
        disabled
          ? {}
          : {
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
      py={2}
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
          bg={isSelected ? 'black' : 'white'}
          disabled={isLoading}
          transition={'border-width 200ms ease-in-out'}
        />
        <Text fontSize={'xl'} lineHeight={1} as={'span'} className={className}>
          {name}
        </Text>
      </Stack>
      <Flex
        gap={2}
        alignItems={'center'}
        justifyContent={'flex-end'}
        minW={'7rem'}
      >
        {!isSelected && nextUnitPrice < unitPrice && (
          <Text
            className={'discount'}
            as={'span'}
            fontSize={'xs'}
            opacity={0.6}
            textDecorationLine={'line-through'}
          >
            {`${unitPrice} EUR`}
          </Text>
        )}
        {isSelected ? (
          <Text as={'span'} fontSize={'xs'} opacity={0.6}>
            {`${unitPrice} EUR`}
          </Text>
        ) : (
          <Text as={'span'} fontSize={'xs'}>
            {`${nextUnitPrice} EUR`}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
