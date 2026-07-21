import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { LicenseSize, useOrderContext } from '@/commercelayer/providers/Order'
import { Fieldset, RadioGroup, VStack } from '@chakra-ui/react'
import React, { useCallback, useState } from 'react'
import CustomLicenseSizeDialog from '../pages/buy/custom-license-size'
import ConfirmLicenseSizeChangeDialog from './confirm-license-size-change-dialog'
import { useLicenseSizeChange } from './use-license-size-change'

interface Props {
  label?: string
  info?: string
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
  onResolved?: (applied: boolean) => void
}

export const LicenseSizeList: React.FC<Props> = ({
  label,
  info,
  setLicenseSize,
  onResolved,
}) => {
  const { companySizes: sizes } = useOrderContext()
  const {
    requestSizeChange,
    confirm: hookConfirm,
    cancel: hookCancel,
    confirmOpen,
    displayValue,
  } = useLicenseSizeChange({ onResolved })

  // Custom "50+ employees" contact dialog
  const [open, setOpen] = useState(false)
  // Local flag for the non-size "escape hatch" option (not a real LicenseSize)
  const [escapeHatch, setEscapeHatch] = useState(false)
  // Tracks whether escape hatch was active when a new size was tentatively
  // picked, so we can restore it if the confirm dialog is cancelled.
  const [priorEscapeHatch, setPriorEscapeHatch] = useState(false)

  const cancel = useCallback(() => {
    setEscapeHatch(priorEscapeHatch)
    hookCancel()
  }, [priorEscapeHatch, hookCancel])

  const confirm = useCallback(() => {
    setPriorEscapeHatch(false)
    hookConfirm()
  }, [hookConfirm])

  // Radio reflects the escape hatch when active, otherwise the tentative
  // (pending, while the confirm dialog is open) or committed license size.
  const selectedValue = escapeHatch ? 'escapeHatch' : displayValue?.value || ''

  const handleSizeChange = useCallback(
    (value: string) => {
      if (value === 'escapeHatch') {
        // Clear license size so allLicenseInfoSet becomes false, preventing
        // Add to Cart and checkout until a valid size is selected. This path
        // intentionally bypasses the order-wide confirm dialog.
        setEscapeHatch(true)
        setLicenseSize({ licenseSize: undefined })
        setOpen(true)
        return
      }
      setPriorEscapeHatch(escapeHatch)
      setEscapeHatch(false)
      const selected = sizes.find((size) => size.value === value)
      // Applies immediately when the cart is empty, or opens the "all cart
      // items will be adjusted" confirm when committed items exist.
      requestSizeChange(selected)
    },
    [setLicenseSize, sizes, requestSizeChange, escapeHatch]
  )

  return (
    <Fieldset.Root>
      <RadioGroup.Root
        value={selectedValue}
        onValueChange={(e) => handleSizeChange(e.value)}
        aria-label="License size options"
        variant={'outline'}
        size={'md'}
      >
        <FieldsetLegend info={info}>
          {label || '3. How big is your company?'}
        </FieldsetLegend>
        <Fieldset.Content asChild>
          <VStack mt={1} gap={'3px'}>
            {sizes.map((size) => (
              <RadioGroup.Item
                key={size.value}
                value={size.value}
                py={2}
                px={4}
                w={'full'}
              >
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText
                  fontSize={{ base: 'lg', xl: 'sm', '2xl': 'md', '3xl': 'lg' }}
                >
                  {size.label}
                </RadioGroup.ItemText>
              </RadioGroup.Item>
            ))}
            <RadioGroup.Item
              key={'escapeHatch'}
              value={'escapeHatch'}
              py={2}
              px={4}
              w={'full'}
            >
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText
                fontSize={{ base: 'lg', xl: 'sm', '2xl': 'md', '3xl': 'lg' }}
              >
                {'50+ employees'}
              </RadioGroup.ItemText>
            </RadioGroup.Item>
          </VStack>
        </Fieldset.Content>
      </RadioGroup.Root>
      <CustomLicenseSizeDialog open={open} setOpen={setOpen} />
      <ConfirmLicenseSizeChangeDialog
        open={confirmOpen}
        onCancel={cancel}
        onConfirm={confirm}
      />
    </Fieldset.Root>
  )
}
