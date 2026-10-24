'use client'
import { Box, Button, For } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useParams, usePathname } from 'next/navigation'

import { useDraftGuard } from '@/commercelayer/components/pages/buy/use-draft-guard'
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
  const { locale } = useParams()
  const pathname = usePathname()
  const prefix = locale && locale !== 'en' ? `/${locale}` : ''
  const isCartContext = pathname.includes('/cart/')
  const sortedFonts = [font, ...moreFonts]
  // Switching fonts re-seeds the draft, so confirm before leaving a dirty one
  const { guardedLinkClick } = useDraftGuard()

  return (
    <MenuRoot
      variant={'wrap'}
      size={'custom'}
      open={openTypeMenu}
      onOpenChange={(e) => setTypeMenuOpen(e.open)}
      positioning={{ getAnchorRect: getTypeAnchorRect }}
    >
      <MenuTrigger asChild>
        <Button
          ml={'-4px'}
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
          <Box
            ref={typeRef}
            pos={'absolute'}
            top={'-12px'}
            left={'0px'}
          ></Box>
        </Button>
      </MenuTrigger>
      <MenuContent
        portalled={false}
        maxW={'60vw'}
        onMouseLeave={() => {
          setTypeMenuOpen(false)
        }}
      >
        <For each={sortedFonts}>
          {(item) => {
            const href = isCartContext
              ? `${prefix}/cart/buy/${item.slug}`
              : `${prefix}/fonts/${item.slug}/buy`

            return (
              <MenuItem
                key={item.slug}
                value={item.slug}
                className={item.defaultVariant?._id}
                fontSize={'1.5rem'}
                lineHeight={'1.25rem'}
              >
                <Box whiteSpace={'nowrap'} asChild>
                  <NextLink
                    href={href}
                    scroll={false}
                    aria-current={
                      item.slug === font?.slug ? 'page' : undefined
                    }
                    onClick={(e) => {
                      if (
                        e.defaultPrevented ||
                        e.button !== 0 ||
                        e.metaKey ||
                        e.ctrlKey ||
                        e.shiftKey ||
                        e.altKey
                      ) {
                        return
                      }
                      setTypeMenuOpen(false)
                      if (item.slug === font?.slug) {
                        e.preventDefault()
                        return
                      }
                      guardedLinkClick(e, href, { scroll: false })
                    }}
                  >
                    {item.shortName}
                  </NextLink>
                </Box>
              </MenuItem>
            )
          }}
        </For>
      </MenuContent>
    </MenuRoot>
  )
}

export default BuyNav
