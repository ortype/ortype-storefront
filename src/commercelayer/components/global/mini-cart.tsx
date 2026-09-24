import { useOrderContext } from '@/commercelayer/providers/Order'
import { usePriceLocaleContext } from '@/commercelayer/providers/price-locale'
import {
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import {
  Box,
  Button,
  Circle,
  HoverCard,
  HStack,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

interface Props {
  // settings: CheckoutSettings
}

interface FamilySummary {
  stylesCount: number
  parentUid: string
  parentName: string
  defaultVariantId: string
  totalCents: number
}

const summaryFontSize = {
  base: 'lg',
  lg: 'sm',
  xl: 'sm',
  '2xl': 'sm',
}

const MiniCart = ({}: Props): JSX.Element => {
  const {
    order,
    itemsCount,
    selections,
    skuOptions,
    licenseSize,
    isLicenseForClient,
  } = useOrderContext()
  const priceLocale = usePriceLocaleContext()
  const [open, setOpen] = useState(false)

  // @TODO: tech debt — duplicates the per-group total calculation in
  // CartProvider's groupedLineItems memo (providers/cart/index.tsx). Kept
  // separate here so MiniCart doesn't depend on CartProvider being mounted
  // outside of /cart. If the pricing logic changes, update both places, or
  // extract a shared `summarizeSelections` util.
  const familySummaries = useMemo<FamilySummary[]>(() => {
    const modifier = licenseSize?.modifier ?? 0

    return Object.entries(selections ?? {}).map(([parentUid, skus]) => {
      const skuCodes = Object.keys(skus)
      const first = skus[skuCodes[0]]

      const totalCents = skuCodes.reduce((sum, skuCode) => {
        const entry = skus[skuCode]
        const styleOptions = (entry.licenseTypes ?? [])
          .map((ref) => skuOptions?.find((o) => o.reference === ref))
          .filter(Boolean)

        if (styleOptions.length === 0) return sum

        return (
          sum +
          calculateLineItemPrice({
            skuOptions: styleOptions,
            sizeModifier: modifier,
            count: skuCodes.length,
          })
        )
      }, 0)

      return {
        parentUid,
        parentName: first?.parentName ?? '',
        defaultVariantId: first?.defaultVariantId ?? '',
        totalCents,
        stylesCount: skuCodes.length,
      }
    })
  }, [selections, skuOptions, licenseSize?.modifier])

  return (
    <HoverCard.Root
      size='sm'
      open={open}
      openDelay={200}
      closeDelay={500}
      positioning={{ placement: 'bottom-start' }}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <HoverCard.Trigger asChild>
        <Circle
          fontSize={'md'}
          // size={11}
          size={10}
          width={itemsCount < 10 ? 'var(--or-sizes-5) !important' : 'auto'}
          bg={'red'}
          color={'white'}
          asChild
        >
          <Link href={'/cart'}>{itemsCount}</Link>
        </Circle>
      </HoverCard.Trigger>
      <Portal>
        <HoverCard.Positioner>
          <HoverCard.Content minW='240px' asChild>
            <VStack gap={2} alignItems={'flex-start'} w={'full'}>
              {/*<HStack
                justify='space-between'
                w='full'
                borderBottom={'1px solid #E7E0BF'}
                fontSize={'sm'}
                lineHeight={1}
                py={0}
                px={0}
                h={6}
              >*/}
              {
                /*isLicenseForClient
                  ? order?.metadata?.license?.owner?.company
                  : 'Yourself'*/
                //
              }
              {/*licenseSize?.label && (
                  <>
                    <Text
                      as={'span'}
                      minW={'8rem'}
                      color={'brand.500'}
                      textStyle={'xs'}
                      w={'50%'}
                    >
                      {'License size'}
                    </Text>
                    <Text
                      as={'span'}
                      textStyle={'xs'}
                      textAlign={'right'}
                      flexGrow={1}
                      pl={0}
                      w={'50%'}
                    >
                      {licenseSize.label}
                    </Text>
                  </>
                )*/}
              {/*</HStack>*/}

              {familySummaries.map((family) => (
                <VStack
                  key={family.parentUid}
                  pb={2}
                  gap={0.5}
                  borderBottom={'1px solid #E7E0BF'}
                  w={'full'}
                  alignItems={'flex-start'}
                >
                  <Text fontSize={'lg'} className={family.defaultVariantId}>
                    {family.parentName}
                  </Text>
                  <Text as={'span'} fontSize={'xs'}>
                    {`${family.stylesCount} styles \u00b7 ${formatPrice(family.totalCents, priceLocale)} EUR`}
                  </Text>
                </VStack>
              ))}
              {/*<Box h={1} w={'full'} borderBottom={'1px solid #E7E0BF'} />*/}
              <Button
                asChild
                // alignSelf={'flex-end'}
                w={'full'}
                variant={'outline'}
                bg={'colorPalette.fg'}
                color={'colorPalette.bg'}
                borderRadius={'5rem'}
                size={'xs'}
                fontSize={'md'}
                css={{
                  _hover: {
                    bg: 'transparent',
                    color: 'colorPalette.fg',
                  },
                }}
              >
                <Link href={'/cart/'}>{'Proceed to Cart →'}</Link>
              </Button>
            </VStack>
          </HoverCard.Content>
        </HoverCard.Positioner>
      </Portal>
    </HoverCard.Root>
  )
}

export default MiniCart
