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
            {font.shortName + ' ' + 'Full Family'}
          </Text>
          <Text fontSize={'sm'} as={'div'}>
            {`${styleCount} Styles — Variable Font Included`}
          </Text>
        </Stack>
      </Stack>
      <Flex gap={2} alignItems={'center'}>
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
