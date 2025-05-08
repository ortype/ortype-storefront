'use client'
import { BuyProvider } from '@/commercelayer/providers/Buy'
import type { FontPagePayload } from '@/types'
import {
  Box,
  Button,
  Link as ChakraLink,
  Container,
  For,
  Heading,
} from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { BuyFontsQueryResult } from '@/types'

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  MenuTriggerItem,
} from '@/components/ui/menu'
import { useMemo } from 'react'

export interface BuyPageProps {
  data: BuyFontsQueryResult | null
}

const DynamicBuy: any = dynamic(() => import('@/components/composite/Buy'), {
  loading: function LoadingSkeleton() {
    return <div />
  },
})

export function BuyPage({ data }: BuyPageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { font, moreFonts } = data ?? {}

  const BuyNav = () => {
    return (
      <MenuRoot>
        <MenuTrigger asChild>
          <ChakraLink
            href={'#'}
            variant={'underline'}
            className={font ? font.defaultVariant?._id : ''}
          >
            {font?.shortName}
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

  return (
    <Container my={6}>
      <Heading
        textAlign={'center'}
        size={'2xl'}
        fontWeight={'normal'}
        textTransform={'uppercase'}
        mx={'auto'}
        my={2}
      >
        {`you or me or they are buying `}
        <BuyNav />
      </Heading>
      <BuyProvider font={font}>
        <DynamicBuy />
      </BuyProvider>
    </Container>
  )
}

export default BuyPage
