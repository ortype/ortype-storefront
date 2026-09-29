import { useBuyContext } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { usePriceLocaleContext } from '@/commercelayer/providers/price-locale'
import { formatPrice } from '@/commercelayer/utils/prices'
import {
  Box,
  Button,
  Circle,
  Flex,
  HStack,
  Presence,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

const ANIMATION_DURATION = 0.3

// The wrapper animates its own height so the surrounding panel grows/shrinks
// smoothly. `when` sequences the two animations: expand the height BEFORE the
// button animates in, and collapse it AFTER the button animates out.
const buttonContainerVariants: Variants = {
  hidden: {
    height: 0,
    transition: {
      // when: 'afterChildren',
      delay: 0.1,
      duration: ANIMATION_DURATION,
      ease: 'easeInOut',
    },
  },
  visible: {
    height: 'auto',
    transition: {
      when: 'beforeChildren',
      // delay: 0.1,
      duration: ANIMATION_DURATION,
      ease: 'easeInOut',
    },
  },
}

// The button slides in/out from the top and fades. It inherits the active
// variant label ('hidden' / 'visible') from the wrapper above.
const buttonVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    transition: {
      duration: ANIMATION_DURATION,
      ease: 'easeInOut',
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION,
      ease: 'easeInOut',
    },
  },
}

export const BuySummary = ({
  isCommitting,
  setIsCommitting,
}: {
  isCommitting: boolean
  setIsCommitting: (value: boolean) => void
}) => {
  // Header badge count (derived from saved `selections`, so it only changes on
  // save, not on every click in the dialog)
  const { itemsCount } = useOrderContext()
  // Everything else reflects this font's unsaved draft
  const {
    font,
    summary,
    selectedSkus,
    licenseSkuOptions,
    canSelect,
    isCommitted,
    isDirty,
    save,
    remove,
  } = useBuyContext()
  const priceLocale = usePriceLocaleContext()

  const {
    defaultVariant: { _id: defaultVariantId },
  } = font

  const hasFontSelections = Object.keys(selectedSkus).length > 0

  const licensesCount = licenseSkuOptions.length

  // Draft differs from the cart → "Add to cart" / "Update cart"
  const showAddUpdateButton = canSelect && hasFontSelections && isDirty
  // Draft matches what's in the cart → link to the cart
  const showCartLink = canSelect && hasFontSelections && !isDirty
  // Every style deselected on a font that is in the cart → offer removal
  const showRemove = isCommitted && !hasFontSelections

  const runAction = async (
    action: () => Promise<{ success: boolean; error?: unknown }>
  ) => {
    setIsCommitting(true)
    try {
      const result = await action()
      if (!result.success) {
        console.error('[Buy] cart update failed:', result.error)
      }
    } catch (e) {
      console.error('[Buy] cart update error:', e)
    } finally {
      setIsCommitting(false)
    }
  }

  // All pricing now derived from the selection buffer via BuyProvider
  const {
    show: showSummaryPanel,
    fontStyleCount: fontLineItemCount,
    unitPriceCents,
    subtotalCents,
    percentageDiscount,
    totalDiscountCents,
    totalCents,
  } = summary

  const summaryFontSize = {
    base: 'lg',
    lg: 'sm',
    '3xl': 'md',
  }

  return (
    <>
      <HStack
        pos={{ base: 'relative', lg: 'fixed' }}
        right={{ base: 'auto', lg: 4 }}
        top={{ base: 'auto', lg: 4 }}
        gap={1}
      >
        {/* NAVIGATION */}
        <Presence
          present={showCartLink}
          animationName={{
            _open: 'slide-from-top, fade-in',
            _closed: 'slide-to-top, fade-out',
          }}
          animationDuration='moderate'
        >
          <Button
            asChild
            variant={'outline'}
            bg={'colorPalette.fg'}
            color={'colorPalette.bg'}
            borderRadius={'5rem'}
            size={'xs'}
            h={10}
            fontSize={'md'}
            css={{
              _hover: {
                bg: 'transparent',
                color: 'colorPalette.fg',
              },
            }}
          >
            <Link href={'/cart/'}>{'Cart →'}</Link>
          </Button>
        </Presence>
        <Circle
          fontSize={'md'}
          size={10}
          width={itemsCount < 10 ? 'var(--or-sizes-5) !important' : 'auto'}
          bg={'red'}
          color={'white'}
          asChild
        >
          <Link href={'/cart'}>{itemsCount}</Link>
        </Circle>
      </HStack>
      <Presence
        present={!showSummaryPanel}
        animationName={{
          _open: 'slide-from-right, fade-in',
          _closed: 'slide-to-right, fade-out',
        }}
        animationDuration='moderate'
        pos={{ base: 'relative', lg: 'fixed' }}
        right={{ base: 'auto', lg: '1rem', '3xl': '2rem' }}
        top={{ base: 'auto', lg: 5 }}
      >
        <Box
          w={{
            base: '100%',
            lg: '16rem',
            '2xl': '17rem',
            '3xl': '18rem',
          }}
          bg={'#FFF8D3'}
          my={{ base: 4, xl: 0 }}
          borderRadius={20}
          px={4}
          py={5}
        >
          <VStack gap={2}>
            <Text textStyle={summaryFontSize} w={'full'}>
              {showRemove
                ? 'Select styles to keep, or remove this font from your cart'
                : 'Select your fonts'}
            </Text>
            {showRemove && (
              <Button
                variant={'solid'}
                bg={'black'}
                borderRadius={'5rem'}
                size={'sm'}
                fontSize={'md'}
                color={'white'}
                disabled={isCommitting}
                w={'full'}
                gap={1}
                _hover={{ bg: 'red' }}
                onClick={() => runAction(remove)}
              >
                {isCommitting ? (
                  <>
                    <Spinner size={'xs'} /> {'Processing...'}
                  </>
                ) : (
                  'Remove from cart'
                )}
              </Button>
            )}
          </VStack>
        </Box>
      </Presence>
      <Presence
        present={showSummaryPanel}
        animationName={{
          _open: 'slide-from-right, fade-in',
          _closed: 'slide-to-right, fade-out',
        }}
        animationDuration='moderate'
        pos={{ base: 'relative', lg: 'fixed' }}
        right={{ base: 'auto', lg: '1rem', '3xl': '2rem' }}
        top={{ base: 'auto', lg: 16 }}
      >
        <Box
          w={{
            base: '100%',
            lg: '16rem',
            '2xl': '17rem',
            '3xl': '18rem',
          }}
          bg={'#FFF8D3'}
          my={{ base: 4, lg: 0 }}
          borderRadius={20}
          px={4}
          py={5}
        >
          <VStack gap={2}>
            <Flex
              w={'full'}
              justifyContent={'space-between'}
              borderBottom={'1px solid #CEC9AB'}
              alignItems={'center'}
              pb={2}
              h={8}
            >
              <Text
                textStyle={{
                  base: 'lg',
                  lg: 'md',
                  xl: 'lg',
                }}
                textTransform={'uppercase'}
                className={defaultVariantId}
              >
                {font.shortName}
              </Text>
            </Flex>
            <Flex
              w={'full'}
              justifyContent={'space-between'}
              borderBottom={'1px solid #CEC9AB'}
              alignItems={'center'}
              pb={2}
            >
              <Text as={'span'} textStyle={summaryFontSize} w={'50%'}>
                {' '}
                {`Licenses`}
              </Text>
              <Text
                as={'span'}
                pl={1}
                textStyle={summaryFontSize}
              >{`${licensesCount}`}</Text>
            </Flex>
            <Flex
              w={'full'}
              justifyContent={'space-between'}
              borderBottom={'1px solid #CEC9AB'}
              alignItems={'center'}
              pb={2}
            >
              <Text as={'span'} textStyle={summaryFontSize} w={'50%'}>
                {' '}
                {`Styles`}
              </Text>
              <Text
                as={'span'}
                pl={1}
                textStyle={summaryFontSize}
              >{`${fontLineItemCount}`}</Text>
            </Flex>
            <Flex
              w={'full'}
              justifyContent={'space-between'}
              borderBottom={'1px solid #CEC9AB'}
              alignItems={'flex-start'}
              pb={2}
            >
              <Text as={'span'} textStyle={summaryFontSize} w={'50%'}>
                {' '}
                {`Unit Price`}
              </Text>
              <Text as={'span'} pl={1} textStyle={summaryFontSize}>
                {formatPrice(unitPriceCents, priceLocale)}
              </Text>
            </Flex>
            <Flex
              w={'full'}
              // pt={2}
              // borderTop={'1px solid #CEC9AB'}
              // mt={-1}

              justifyContent={'space-between'}
              borderBottom={'1px solid #CEC9AB'}
              alignItems={'flex-start'}
              pb={2}
            >
              <Text as={'span'} textStyle={summaryFontSize} w={'50%'}>
                {' '}
                {`Subtotal`}
              </Text>
              <Text as={'span'} pl={1} textStyle={summaryFontSize}>
                {formatPrice(subtotalCents, priceLocale)}
              </Text>
            </Flex>
            <Presence
              present={totalDiscountCents > 0}
              animationName={{
                _open: 'slide-from-top, fade-in',
                _closed: 'slide-to-top, fade-out',
              }}
              animationDuration='faster'
              w={'full'}
            >
              <Flex
                w={'full'}
                justifyContent={'space-between'}
                borderBottom={'1px solid #CEC9AB'}
                alignItems={'flex-start'}
                pb={2}
              >
                <Text
                  textStyle={summaryFontSize}
                  w={'50%'}
                  whiteSpace={'nowrap'}
                >
                  {`Discounts (${percentageDiscount}%)`}
                </Text>
                <Text pl={1} textStyle={summaryFontSize}>
                  {`-`}
                  {formatPrice(totalDiscountCents, priceLocale)}
                </Text>
              </Flex>
            </Presence>
            <Flex
              w={'full'}
              mt={-1}
              justifyContent={'space-between'}
              borderTop={'1px solid #CEC9AB'}
              alignItems={'center'}
              pt={2}
            >
              <Text
                textStyle={summaryFontSize}
                w={'50%'}
                textTransform={'uppercase'}
              >
                {`TOTAL EUR`}
              </Text>
              <Text
                fontWeight={500}
                as={'span'}
                pl={1}
                textStyle={summaryFontSize}
              >
                {formatPrice(totalCents, priceLocale)}
              </Text>
            </Flex>
          </VStack>
          {/* SAVE CONFIGURATION */}
          <AnimatePresence>
            {showAddUpdateButton && (
              <motion.div
                key='button'
                variants={buttonContainerVariants}
                initial='hidden'
                animate='visible'
                exit='hidden'
                style={{ overflow: 'hidden' }}
              >
                <motion.div variants={buttonVariants}>
                  <Button
                    variant={'solid'}
                    bg={'black'}
                    borderRadius={'5rem'}
                    size={'sm'}
                    fontSize={'md'}
                    color={'white'}
                    disabled={isCommitting}
                    mt={2}
                    w={'full'}
                    gap={1}
                    _hover={{ bg: 'red' }}
                    onClick={() => runAction(save)}
                  >
                    {isCommitting ? (
                      <>
                        <Spinner size={'xs'} /> {'Processing...'}
                      </>
                    ) : !isCommitted ? (
                      'Add to cart'
                    ) : (
                      'Update cart'
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/*<Presence
            present={
              allLicenseInfoSet &&
              hasFontSelections &&
              !isGroupCommitted(fontUid)
            }
            animationName={{
              _open: 'slide-from-top, fade-in',
              _closed: 'slide-to-top, fade-out',
            }}
            animationDuration="moderate"
          >
            <Button
              variant={'solid'}
              bg={'black'}
              borderRadius={'5rem'}
              size={'sm'}
              fontSize={'md'}
              color={'white'}
              disabled={isCommitting}
              mt={2}
              gap={1}
              _hover={{ bg: 'red' }}
              onClick={async () => {
                setIsCommitting(true)
                try {
                  await commitGroup(fontUid)
                } catch (e) {
                  console.error('[Buy] commitGroup error:', e)
                } finally {
                  setIsCommitting(false)
                }
              }}
            >
              {isCommitting ? (
                <>
                  <Spinner size={'xs'} /> {'Processing...'}
                </>
              ) : !groupIsCommitted ? (
                'Update cart'
              ) : (
                'Add to cart'
              )}
            </Button>
          </Presence>*/}
        </Box>
      </Presence>
    </>
  )
}

export default BuySummary
