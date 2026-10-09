'use client'

import { useCartContext } from '@/commercelayer/providers/cart'
import { Button, HStack, Stack, Text } from '@chakra-ui/react'

/**
 * Unsaved cart edits: "Update cart" writes them, "Discard" drops them.
 * Foundation only (logic + bare markup); style and word it as needed.
 */
export const CartActionBar = () => {
  const {
    isDirty,
    dirtyFonts,
    isSaving,
    saveProgress,
    saveError,
    save,
    discard,
  } = useCartContext()

  // Stay mounted while saving (the last font leaves the draft before the save
  // settles) and after a failed save (to show the error).
  if (!isDirty && !isSaving && !saveError) return null

  const progress =
    saveProgress && saveProgress.total > 1
      ? ` ${Math.min(saveProgress.done + 1, saveProgress.total)} of ${saveProgress.total}`
      : ''

  return (
    <Stack role='status' aria-live='polite' gap={2} w={'full'}>
      <Text>{`Unsaved changes · ${dirtyFonts.length} ${dirtyFonts.length === 1 ? 'font' : 'fonts'}`}</Text>
      <HStack>
        <Button disabled={isSaving || !isDirty} onClick={() => void save()}>
          {isSaving ? `Updating${progress}…` : 'Update cart'}
        </Button>
        <Button variant={'ghost'} disabled={isSaving} onClick={discard}>
          {'Discard'}
        </Button>
      </HStack>
      {saveError && <Text role='alert'>{saveError}</Text>}
    </Stack>
  )
}

export default CartActionBar
