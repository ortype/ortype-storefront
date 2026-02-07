'use client'
import { Box, IconButton, Link as ChakraLink, For } from '@chakra-ui/react'
import { FiChevronDown } from 'react-icons/fi'
import Link from 'next/link'
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from '@/components/ui/menu'
import type { BuyFontsQueryResult } from '@/types'

interface BuyNavProps {
  font: BuyFontsQueryResult['font']
  moreFonts: BuyFontsQueryResult['moreFonts']
}

const BuyNav = ({ font, moreFonts }: BuyNavProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <ChakraLink
          href={'#'}
          variant={'underline'}
          className={font ? font.defaultVariant?._id : ''}
          gap={0.5}
        >
          {font?.shortName}
          <IconButton
            variant={'plain'}
            px={0}
            minW={'auto'}
            aria-label="Navigate to another font's buy page"
          >
            <FiChevronDown width={'5rem'} height={'5rem'} />
          </IconButton>
        </ChakraLink>
      </MenuTrigger>
      <MenuContent maxW={'60vw'}>
        <For each={moreFonts}>
          {(item, index) => (
            <MenuItem
              key={index}
              value={item.slug}
              className={item.defaultVariant?._id}
              fontSize={'1.5rem'}
              lineHeight={'1.25rem'}
            >
              <Box whiteSpace={'nowrap'} asChild>
                <Link href={`/buy/${item.slug}`}>{item.shortName}</Link>
              </Box>
            </MenuItem>
          )}
        </For>
      </MenuContent>
    </MenuRoot>
  )
}

export default BuyNav
