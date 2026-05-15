'use client'
import {
  Box,
  Button,
  Link as ChakraLink,
  For,
  IconButton,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@sanity/icons'
import NextLink from 'next/link'

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from '@/components/ui/menu'
import type { BuyFontsQueryResult } from '@/types'
import { useRef, useState } from 'react'

interface BuyNavProps {
  font: BuyFontsQueryResult['font']
  moreFonts: BuyFontsQueryResult['moreFonts']
}

const BuyNav = ({ font, moreFonts }: BuyNavProps) => {
  const typeRef = useRef<HTMLDivElement | null>(null)
  const getTypeAnchorRect = () => typeRef.current!.getBoundingClientRect()
  const [openTypeMenu, setTypeMenuOpen] = useState(false)
  const sortedFonts = [font, ...moreFonts]

  return (
    <>
      <Button
        ml={'-3px'}
        p={2}
        variant={'square'}
        fontSize={'1.5rem'}
        lineHeight={'1.25rem'}
        h={11}
        onMouseEnter={() => {
          setTypeMenuOpen(true)
        }}
        className={font ? font.defaultVariant?._id : ''}
      >
        {font ? font.shortName : 'Type'}
        <Box ref={typeRef} pos={'absolute'} top={'-11px'} left={'0px'}></Box>
      </Button>
      <MenuRoot
        variant={'wrap'}
        open={openTypeMenu}
        onOpenChange={(e) => setTypeMenuOpen(e.open)}
        positioning={{ getAnchorRect: getTypeAnchorRect }}
      >
        <MenuContent
          portalled={false}
          maxW={'60vw'}
          onMouseLeave={() => {
            setTypeMenuOpen(false)
          }}
        >
          <For each={sortedFonts}>
            {(item, index) => (
              <MenuItem
                key={index}
                value={item.slug}
                className={item.defaultVariant?._id}
                fontSize={'1.5rem'}
                lineHeight={'1.25rem'}
              >
                <Box whiteSpace={'nowrap'} asChild>
                  <NextLink href={`/fonts/${item.slug}/buy`}>
                    {item.shortName}
                  </NextLink>
                </Box>
              </MenuItem>
            )}
          </For>
        </MenuContent>
      </MenuRoot>
    </>
  )
}

export default BuyNav
