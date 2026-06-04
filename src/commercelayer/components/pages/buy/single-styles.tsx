import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'

interface Props {
  name: string
  skuCode: string
  className?: string
  isSelected: boolean
  unitPrice: number
  nextUnitPrice: number
  onToggle: () => void
}

export const SingleStyles: React.FC<Props> = ({
  name,
  skuCode,
  className,
  isSelected,
  unitPrice,
  nextUnitPrice,
  onToggle,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    onToggle()
    setIsLoading(false)
  }

  return (
    <Flex
      justifyContent={'space-between'}
      bg={isSelected ? 'blackAlpha.300' : 'brand.50'}
      borderRadius={isSelected ? 'full' : '0px'}
      cursor={'pointer'}
      _hover={{
        borderRadius: '100px',
        bg: 'blackAlpha.300',
        '& .toggle-button': {
          borderWidth: '4px',
        },
      }}
      onClick={handleClick}
      transition={
        'border-radius 200ms ease-in-out, background 300ms ease-in-out'
      }
      py={2}
      px={3}
    >
      <Stack direction={'row'} gap={2} alignItems={'center'}>
        <Button
          className={'toggle-button'}
          variant={'circle'}
          w={6}
          borderWidth={'2px'}
          h={6}
          minW={6}
          p={0}
          bg={isSelected ? 'black' : 'white'}
          disabled={isLoading}
          transition={'border-width 200ms ease-in-out'}
        />
        <Text fontSize={'2xl'} lineHeight={1} as={'span'} className={className}>
          {name}
        </Text>
      </Stack>
      <Flex gap={2} alignItems={'center'}>
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
            {`ADDED`}
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
