import LicenseOwnerRadio from '@/commercelayer/components/forms/license-owner-radio'
import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { useBuyContext } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { AnimatePresence, motion, type Variants } from 'framer-motion'

import {
  Box,
  Button,
  Fieldset,
  Flex,
  GridItem,
  Presence,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import React, { useState } from 'react'
import Typefaces from './typefaces'

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
    transition: { duration: ANIMATION_DURATION, ease: 'easeInOut' },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: ANIMATION_DURATION, ease: 'easeInOut' },
  },
}

interface FontVariant {
  _id: string
  optionName: string
  parentUid: string
}

export const Buy = () => {
  const {
    selections,
    isLicenseForClient,
    skuOptions,
    setLicenseSize,
    selectedSkuOptions,
    setSelectedSkuOptions,
    allLicenseInfoSet,
    isCreatingOrder,
    buyLabels,
    isGroupCommitted,
    commitGroup,
    committedGroups,
  } = useOrderContext()
  const { font, summary } = useBuyContext()

  // Add to cart / Go to cart button state
  const [isCommitting, setIsCommitting] = useState(false)
  const fontUid = font.uid!
  const groupIsCommitted = isGroupCommitted(fontUid)
  const hasFontSelections = Object.keys(selections[font.uid] ?? {}).length > 0

  const licensesCount = selectedSkuOptions?.length

  const showAddUpdateButton =
    allLicenseInfoSet && hasFontSelections && !groupIsCommitted

  // All pricing now derived from the selection buffer via BuyProvider
  const {
    show: showSummaryPanel,
    fontStyleCount: fontLineItemCount,
    unitPrice,
    subtotal,
    percentageDiscount,
    totalDiscount,
    total,
  } = summary

  return (
    <Box pos={'relative'}>
      <Box
        maxW={['100%']}
        ml={{ base: '1rem', xl: '15rem', '3xl': '21rem' }}
        mr={{
          base: '1rem',
          lg: '15rem',
          xl: '15rem',
          '2xl': '17rem',
          '3xl': '21rem',
        }}
        position={'relative'}
      >
        <SimpleGrid columns={2} gap={[12, null, null, null, null, null, 12]}>
          <GridItem colSpan={2}>
            <LicenseOwnerRadio
              label={buyLabels?.licenseHolder?.label}
              info={buyLabels?.licenseHolder?.info}
            />
            {isLicenseForClient && (
              <Box my={2}>
                <LicenseOwnerInput
                  label={'Company info'}
                  info={
                    'Please let us know the company name of your client, the typeface license owner.'
                  }
                />
              </Box>
            )}
          </GridItem>
          <GridItem colSpan={{ base: 2, md: 1, '2xl': 1 }}>
            <LicenseSizeList
              label={buyLabels?.companySize?.label}
              info={buyLabels?.companySize?.info}
              setLicenseSize={setLicenseSize}
            />
          </GridItem>
          <GridItem colSpan={{ base: 2, md: 1, '2xl': 1 }}>
            <LicenseTypeList
              label={buyLabels?.licenseType?.label}
              info={buyLabels?.licenseType?.info}
              font={font}
              skuOptions={skuOptions}
              selectedSkuOptions={selectedSkuOptions}
              setSelectedSkuOptions={setSelectedSkuOptions}
            />
          </GridItem>
          <GridItem colSpan={2}>
            <Fieldset.Root>
              <FieldsetLegend>
                {buyLabels?.fonts?.label || '4. Typefaces'}
              </FieldsetLegend>
              <Fieldset.Content
                p={0}
                m={0}
                pos={'relative'}
                pointerEvents={
                  allLicenseInfoSet && !isCreatingOrder ? 'auto' : 'none'
                }
                opacity={allLicenseInfoSet ? 1 : 0.3}
              >
                <Typefaces />
              </Fieldset.Content>
            </Fieldset.Root>
          </GridItem>
        </SimpleGrid>
        {(isCreatingOrder || isCommitting) && (
          <Flex
            pos={'absolute'}
            inset={0}
            align={'center'}
            justify={'center'}
            bg={'whiteAlpha.700'}
            zIndex={1}
          >
            {/*<Spinner size={'lg'} />*/}
          </Flex>
        )}
      </Box>
      <Presence
        present={showSummaryPanel}
        animationName={{
          _open: 'slide-from-right, fade-in',
          _closed: 'slide-to-right, fade-out',
        }}
        animationDuration="moderate"
        pos={{ base: 'relative', lg: 'fixed' }}
        right={{ base: 'auto', lg: '1rem', '3xl': '2rem' }}
        top={{ base: 'auto', lg: 5 }}
      >
        <Box
          w={{ base: '100%', lg: '13rem', '2xl': '15rem', '3xl': '17rem' }}
          bg={'#FFF8D3'}
          my={{ base: 4, xl: 0 }}
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
                textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
                w={'50%'}
                textTransform={'uppercase'}
              >
                {'Summary'}
              </Text>
              {/* NAVIGATION */}
              <Presence
                present={
                  allLicenseInfoSet &&
                  hasFontSelections &&
                  isGroupCommitted(fontUid)
                }
                animationName={{
                  _open: 'slide-from-top, fade-in',
                  _closed: 'slide-to-top, fade-out',
                }}
                animationDuration="moderate"
              >
                <Button
                  asChild
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
                  <Link href={'/cart/'}>{'Cart →'}</Link>
                </Button>
              </Presence>
            </Flex>
            <Flex
              w={'full'}
              justifyContent={'space-between'}
              borderBottom={'1px solid #CEC9AB'}
              alignItems={'center'}
              pb={2}
            >
              <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
                {' '}
                {`Styles`}
              </Text>
              <Text
                pl={1}
                textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
              >{`${fontLineItemCount}`}</Text>
            </Flex>
            <Flex
              w={'full'}
              justifyContent={'space-between'}
              borderBottom={'1px solid #CEC9AB'}
              alignItems={'center'}
              pb={2}
            >
              <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
                {' '}
                {`Licenses`}
              </Text>
              <Text
                pl={1}
                textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
              >{`${licensesCount}`}</Text>
            </Flex>
            <Flex
              w={'full'}
              justifyContent={'space-between'}
              borderBottom={'1px solid #CEC9AB'}
              alignItems={'center'}
              pb={2}
            >
              <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
                {' '}
                {`Unit Price`}
              </Text>
              <Text
                pl={1}
                textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
              >{`${unitPrice} EUR`}</Text>
            </Flex>
            <Flex
              w={'full'}
              justifyContent={'space-between'}
              borderBottom={'1px solid #CEC9AB'}
              alignItems={'center'}
              pb={2}
            >
              <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
                {' '}
                {`Subtotal`}
              </Text>
              <Text
                pl={1}
                textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
              >{`${subtotal} EUR`}</Text>
            </Flex>
            <Presence
              present={totalDiscount > 0}
              animationName={{
                _open: 'slide-from-top, fade-in',
                _closed: 'slide-to-top, fade-out',
              }}
              animationDuration="faster"
              w={'full'}
            >
              <Flex
                w={'full'}
                justifyContent={'space-between'}
                borderBottom={'1px solid #CEC9AB'}
                alignItems={'center'}
                pb={2}
              >
                <Text
                  textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
                  w={'50%'}
                  whiteSpace={'nowrap'}
                >
                  {`Discount (${percentageDiscount * 100}%)`}
                </Text>
                <Text
                  pl={1}
                  textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
                >{`-${totalDiscount} EUR`}</Text>
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
                textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
                w={'50%'}
                textTransform={'uppercase'}
              >
                {`TOTAL`}
              </Text>
              <Text pl={1} textStyle={'md'}>{`${total} EUR`}</Text>
            </Flex>
          </VStack>
          {/* SAVE CONFIGURATION */}
          <AnimatePresence>
            {showAddUpdateButton && (
              <motion.div
                key="button"
                variants={buttonContainerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
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
                    ) : !committedGroups[font.uid] ? (
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
    </Box>
  )
}

export default Buy
