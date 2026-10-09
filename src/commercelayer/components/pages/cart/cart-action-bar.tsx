'use client'
import {
  buildCartShareUrl,
  encodeCartShare,
} from '@/commercelayer/utils/cart-share'
import { toaster } from '@/components/ui/toaster'

import { useCartContext } from '@/commercelayer/providers/cart'
import { Box, Button, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useState } from 'react'
import { CheckoutButton } from '../../ui/checkout-button'
import ShareCartDialog from './share-cart-dialog'

const ANIMATION_DURATION = 0.3

// Same pattern as buy-summary: the wrapper animates height so the surrounding
// layout grows/shrinks smoothly, and the content slides + fades inside it.
const panelContainerVariants: Variants = {
  hidden: {
    height: 0,
    transition: {
      // Let the content fade/slide out first, then collapse the (now empty)
      // wrapper, so the clipped content never looks squashed mid-exit.
      when: 'afterChildren',
      duration: ANIMATION_DURATION,
      ease: 'easeInOut',
    },
  },
  visible: {
    height: 'auto',
    transition: {
      when: 'beforeChildren',
      duration: ANIMATION_DURATION,
      ease: 'easeInOut',
    },
  },
}

const panelVariants: Variants = {
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

/**
 * Unsaved cart edits: "Update cart" writes them, "Discard" drops them.
 * Foundation only (logic + bare markup); style and word it as needed.
 */
export const CartActionBar = () => {
  const {
    orderId,
    isDirty,
    dirtyFonts,
    isSaving,
    saveProgress,
    allLicenseInfoSet,
    licenseSize,
    saveError,
    selections,
    groupResolutions,
    save,
    discard,
  } = useCartContext()

  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string>()

  // Build the share link when the panel opens. Carts too large to fit in a
  // link bail out with a warning (see CART_SHARE_MAX_TOKEN_LENGTH).
  const handleShareClick = () => {
    /*    if (shareOpen) {
      setShareOpen(false)
      setShareUrl(undefined)
      return
    }*/
    setShareOpen(true)
    const result = encodeCartShare(selections, groupResolutions, licenseSize)
    if (!result.ok) {
      toaster.create({
        type: 'warning',
        title:
          result.reason === 'too-large'
            ? 'Your cart is too large to share by link'
            : 'There is nothing to share yet',
        description:
          result.reason === 'too-large'
            ? 'Try sharing a smaller selection of fonts.'
            : undefined,
      })
      return
    }
    setShareUrl(buildCartShareUrl(window.location.origin, result.token))
  }

  const progress =
    saveProgress && saveProgress.total > 1
      ? ` ${Math.min(saveProgress.done + 1, saveProgress.total)} of ${saveProgress.total}`
      : ''

  // The edit panel stays mounted while saving (the last font leaves the draft
  // before the save settles) and after a failed save (to show the error).
  const showEditPanel = isDirty || isSaving || !!saveError

  return (
    <>
      {/* Swap between the unsaved-changes panel and the share / checkout
          actions. `wait` collapses the outgoing panel before the next expands. */}
      <AnimatePresence mode='wait' initial={false}>
        {showEditPanel ? (
          <motion.div
            key='edit'
            variants={panelContainerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            style={{ width: '100%' }}
          >
            <motion.div variants={panelVariants}>
              <VStack pt={2} gap={2} w={'full'}>
                <HStack
                  gap={1}
                  w={'full'}
                  alignSelf={'flex-start'}
                  justifyContent={'center'}
                  bg={'#FFF8D3'}
                  px={4}
                  py={2}
                  borderRadius={20}
                >
                  <Text
                    as={'span'}
                    textStyle={'sm'}
                  >{`Unsaved edits · ${dirtyFonts.length} ${dirtyFonts.length === 1 ? 'font ·' : 'fonts ·'}`}</Text>
                  <Button
                    variant='link'
                    size='sm'
                    fontSize='sm'
                    px={0}
                    py={0}
                    color={'black'}
                    h='auto'
                    minH='auto'
                    disabled={isSaving}
                    onClick={discard}
                  >
                    {'Discard'}
                  </Button>
                </HStack>
                <HStack gap={1} minW={'full'}>
                  <Button
                    variant={'solid'}
                    bg={'black'}
                    color={'white'}
                    borderRadius={'5rem'}
                    border={'2px solid #000'}
                    size={'md'}
                    fontSize={'md'}
                    flexGrow={1}
                    gap={1}
                    _hover={{
                      bg: 'transparent',
                      color: 'colorPalette.fg',
                    }}
                    disabled={isSaving || !isDirty}
                    onClick={() => void save()}
                  >
                    {isSaving ? `Updating${progress}…` : 'Update cart'}
                  </Button>
                </HStack>
                <AnimatePresence mode='wait' initial={false}>
                  {saveError && (
                    <motion.div
                      variants={panelVariants}
                      style={{ width: '100%' }}
                    >
                      <Box
                        w={'full'}
                        justifyContent={'center'}
                        bg={'#F8F8F8'}
                        px={4}
                        py={2}
                        borderRadius={20}
                        asChild
                      >
                        <Text textStyle={'sm'} role='alert'>
                          {saveError}
                        </Text>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </VStack>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key='actions'
            variants={panelContainerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            style={{ width: '100%' }}
          >
            <motion.div variants={panelVariants}>
              <VStack
                pt={2}
                gap={2}
                alignSelf={'stretch'}
                alignItems={'stretch'}
              >
                <Stack
                  justifyContent={'flex-end'}
                  gap={2}
                  direction={'row'}
                  alignItems={'stretch'}
                >
                  <Button
                    variant={'outline'}
                    bg={'white'}
                    borderRadius={'5rem'}
                    size={'sm'}
                    fontSize={'md'}
                    _hover={{
                      bg: 'black',
                      color: 'white',
                    }}
                    flexGrow={1}
                    onClick={handleShareClick}
                  >
                    {'Share cart'}
                  </Button>
                  <Button
                    variant={'outline'}
                    bg={'white'}
                    borderRadius={'5rem'}
                    size={'sm'}
                    fontSize={'md'}
                    _hover={{
                      bg: 'black',
                      color: 'white',
                    }}
                    flexGrow={1}
                  >
                    {'Save as PDF'}
                  </Button>
                </Stack>
                <CheckoutButton
                  orderId={orderId || ''}
                  // Unsaved edits must be saved (or discarded) before paying
                  isDisabled={!allLicenseInfoSet || isDirty || isSaving}
                />
              </VStack>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outside the swap so the dialog isn't unmounted with the panel */}
      <ShareCartDialog
        open={!!shareOpen}
        setShareOpen={setShareOpen}
        url={shareUrl}
        onClose={() => setShareUrl(undefined)}
      />
    </>
  )
}

export default CartActionBar
