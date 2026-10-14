import { useOrderContext } from '@/commercelayer/providers/order'
import type { LicenseOwnerInput as LicenseOwnerValue } from '@/commercelayer/providers/order/types'
import { CloseButton } from '@/components/ui/close-button'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Box,
  Button,
  Container,
  Drawer,
  HStack,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import LicenseOwnerRadio from './license-owner-radio'
import LicenseSizeRadioList from './license-size-radio-list'
import LicenseOwnerInput from './LicenseOwnerInput'
import { useLicenseSizeChange } from './use-license-size-change'

/**
 * Cart-side editor for the order-wide license metrics (holder + company size).
 *
 * A company size change reprices every item in the cart, so it is confirmed
 * before being applied. Rather than stacking a second modal on top of this
 * one, the tentative choice is held by `useLicenseSizeChange` and surfaced as
 * an alert under the list; this dialog's own Cancel / Ok footer resolves it
 * (Cancel reverts to the committed size, Ok applies it and reprices).
 *
 * The holder fields write through to the provider as they are edited (and sync
 * to the order in the background), so "incomplete" state can exist while the
 * dialog is open. Ok is therefore gated on the holder being complete, and
 * every dismissal path restores the holder as it was when the dialog opened —
 * otherwise a half-finished "Your client" switch would silently disable
 * checkout with no way back.
 */
export default function EditLicenseMetricsDialog({
  label,
  info,
  isLicenseForClient,
  open,
  onOpenChange,
}: {
  label?: string
  info?: string
  isLicenseForClient: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { licenseOwner, setLicenseOwner } = useOrderContext()
  const { requestSizeChange, confirm, cancel, confirmOpen, displayValue } =
    useLicenseSizeChange()

  // The holder as it was when the dialog opened, so Cancel is a real escape.
  const ownerSnapshotRef = useRef<LicenseOwnerValue | undefined>(undefined)
  useEffect(() => {
    if (open) ownerSnapshotRef.current = licenseOwner
    // Snapshot on open only: later edits are what Cancel is meant to undo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Mirrors the order reducer's `hasLicenseOwner`: a holder must be chosen,
  // and "Your client" additionally requires a company name ("Yourself" does
  // not). Anything less leaves checkout disabled, so Ok stays unavailable.
  const hasOwnerType = typeof licenseOwner?.is_client === 'boolean'
  const needsCompanyName =
    isLicenseForClient && !licenseOwner?.company?.trim()
  const isOwnerComplete = hasOwnerType && !needsCompanyName

  const restoreOwner = () => {
    const snapshot = ownerSnapshotRef.current
    // The reducer merges partial owners, so both fields are sent explicitly —
    // otherwise a company name typed here would survive the revert.
    setLicenseOwner({
      licenseOwner: {
        is_client: snapshot?.is_client ?? null,
        company: snapshot?.company ?? '',
      },
    })
  }

  const dismiss = () => {
    cancel()
    restoreOwner()
    onOpenChange(false)
  }

  const handleOk = () => {
    if (!isOwnerComplete) return
    if (confirmOpen) confirm()
    onOpenChange(false)
  }

  return (
    <Drawer.Root
      lazyMount
      size={'md'}
      open={open}
      onOpenChange={(e) => {
        // Escape / backdrop / the X all behave like Cancel.
        if (!e.open) {
          dismiss()
          return
        }
        onOpenChange(e.open)
      }}
      // initialFocusEl={() => ref.current}
    >
      <Drawer.Trigger asChild>
        <Button
          variant='text'
          size='xs'
          fontSize='xs'
          px={2}
          py={1}
          h='auto'
          minH='auto'
        >
          {'Edit'}
        </Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop css={{ backdropFilter: 'blur(5px)' }} />
        <Drawer.Positioner
        // p={10}
        >
          <Drawer.Content
            rounded={0}
            // rounded={40}
            p={4}
            bg={'#e7e7e7'}
          >
            <Drawer.CloseTrigger
              position={'absolute'}
              top={'1rem'}
              left={'-4rem'}
              asChild
            >
              <CloseButton size='2xl' />
            </Drawer.CloseTrigger>
            <Drawer.Header pt={2} pb={3}>
              <Drawer.Title
                fontSize={'2rem'}
                fontWeight={'normal'}
                textTransform={'uppercase'}
                lineHeight={1}
                pb={3}
                borderBottom={'1px solid #919191'}
              >
                {`Update license metrics`}
              </Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <VStack gap={4}>
                <Box w={'full'}>
                  <LicenseOwnerRadio
                    label={'License holder'}
                    info={'The license owner is the business entity...'}
                    variant={'outline'}
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
                </Box>
                <LicenseSizeRadioList
                  label={label}
                  info={info}
                  value={displayValue?.value}
                  onSelect={requestSizeChange}
                >
                  {/* Inline stand-in for the former confirm dialog: shown while a
                    different size is selected but not yet applied. */}
                  {confirmOpen && (
                    <Box
                      w={'full'}
                      mt={2}
                      bg={'orange.300'}
                      borderRadius={20}
                      px={4}
                      py={3}
                      role={'alert'}
                    >
                      <Text
                        textStyle={'sm'}
                        // fontWeight={500}
                        textTransform={'uppercase'}
                      >
                        {'Update cart pricing?'}
                      </Text>
                      <Text textStyle={'sm'}>
                        {
                          'Changing the company size updates pricing for every item in your cart. Press Ok to continue.'
                        }
                      </Text>
                    </Box>
                  )}
                </LicenseSizeRadioList>
                {!isOwnerComplete && (
                  <Text textStyle={'sm'} textAlign={'center'} role='alert'>
                    {needsCompanyName
                      ? "Enter your client's company name to save these license metrics."
                      : 'Choose a license holder to save these license metrics.'}
                  </Text>
                )}
                <HStack gap={2} justifyContent={'center'}>
                  <Button
                    onClick={dismiss}
                    variant='text'
                    size='xs'
                    fontSize='xs'
                    px={2}
                    py={1}
                    h='auto'
                    minH='auto'
                  >
                    {'Cancel'}
                  </Button>
                  <Button
                    onClick={handleOk}
                    disabled={!isOwnerComplete}
                    variant={'solid'}
                    bg={'black'}
                    color={'white'}
                    borderRadius={'5rem'}
                    border={'2px solid #000'}
                    size={'sm'}
                    fontSize={'md'}
                    _hover={{
                      bg: 'transparent',
                      color: 'colorPalette.fg',
                    }}
                  >
                    {'Ok'}
                  </Button>
                </HStack>
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
