import type { GroupPriceSummary } from '@/commercelayer/providers/Order/types'
import { Font } from '@/types'
import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'

interface Props {
  font: Font
  summary: GroupPriceSummary
  onToggle: () => void
}

export const FontFull: React.FC<Props> = ({ font, summary, onToggle }) => {
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
      bg={'brand.50'}
      borderRadius={allSelected ? '100px' : '0px'}
      cursor={'pointer'}
      _hover={{
        borderRadius: '100px',
        '& .toggle-button': {
          borderWidth: '3px',
        },
      }}
      onClick={handleClick}
      transition={
        'border-radius 200ms ease-in-out, background 300ms ease-in-out'
      }
      pt={3}
      pb={1}
      px={4}
    >
      <Stack direction={'row'} gap={3} alignItems={'flex-start'}>
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
        <Stack direction={'column'} gap={0.5}>
          <Text
            fontSize={'2xl'}
            lineHeight={1}
            as={'div'}
            className={className}
          >
            {font.shortName + ' ' + 'Full Family'}
          </Text>
          <Text fontSize={'xs'} as={'div'}>
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
          <Stack direction={'column'} gap={0}>
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
