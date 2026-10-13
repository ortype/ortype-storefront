import { useOrderContext } from '@/commercelayer/providers/order'
import type { LicenseOwnerInput as LicenseOwnerValue } from '@/commercelayer/providers/order/types'
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
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import LicenseOwnerRadio from './license-owner-radio'
import LicenseOwnerInput from './LicenseOwnerInput'
import LicenseSizeRadioList from './license-size-radio-list'
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
    <DialogRoot
      lazyMount
      open={open}
      onOpenChange={(e) => {
        // Escape / backdrop / the X all behave like Cancel.
        if (!e.open) {
          dismiss()
          return
        }
        onOpenChange(e.open)
      }}
      size={'full'}
      motionPreset={'slide-in-bottom-custom'}
    >
      <DialogTrigger asChild>
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
      </DialogTrigger>
      <DialogContent
        backdrop={true}
        blurred={true}
        borderRadius={0}
        bg={'transparent'}
        h={'100vh'}
      >
        <DialogBody overflow={'auto'}>
          <DialogTitle
            textAlign={'center'}
            fontSize={'2rem'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
            pb={8}
            my={4}
            lineHeight={1}
          >
            {`Update license metrics`}
          </DialogTitle>
          <Container maxW={'30rem'}>
            <VStack gap={4}>
              <Box w={'full'}>
                <LicenseOwnerRadio
                  label={'License holder'}
                  info={'The license owner is the business entity...'}
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
                    bg={'#FFF8D3'}
                    borderRadius={20}
                    px={4}
                    py={3}
                    role={'alert'}
                  >
                    <Text
                      textStyle={'sm'}
                      fontWeight={500}
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
          </Container>
        </DialogBody>
        <Box position={'absolute'} top={3} left={3}>
          <DialogCloseTrigger
            position={'relative'}
            top={'auto'}
            right={'auto'}
          />
        </Box>
      </DialogContent>
    </DialogRoot>
  )
}
