import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { useOrderContext } from '@/commercelayer/providers/order'
import type { LicenseSize } from '@/commercelayer/providers/order/types'
import { Fieldset, RadioGroup, VStack } from '@chakra-ui/react'
import React, { useCallback, useState } from 'react'
import CustomLicenseMetricDialog from './custom-license-metric'

interface Props {
  label?: string
  info?: string
  /**
   * The value shown as selected. The owner passes the *tentative* size while a
   * change is awaiting confirmation, so the radio reflects what the user just
   * clicked and reverts cleanly when the change is cancelled.
   */
  value?: string
  /** A real size option was picked (the "50+ employees" escape hatch never emits) */
  onSelect: (size?: LicenseSize) => void
  /** Rendered directly below the list, e.g. the pending-change alert */
  children?: React.ReactNode
}

/**
 * Presentational company-size radio list, fully controlled by its owner.
 *
 * Unlike `LicenseSizeList` (used on /buy, which owns `useLicenseSizeChange`
 * and confirms a size change in a nested dialog), this list leaves the
 * confirm/cancel affordances to the parent — the cart's edit dialog confirms
 * inline with an alert plus its own Cancel / Ok footer.
 */
export const LicenseSizeRadioList: React.FC<Props> = ({
  label,
  info,
  value,
  onSelect,
  children,
}) => {
  const { companySizes: sizes } = useOrderContext()
  // Custom "50+ employees" contact dialog
  const [open, setOpen] = useState(false)

  const handleSizeChange = useCallback(
    (nextValue: string) => {
      if (nextValue === 'escapeHatch') {
        // Not a real size: ask the user to get in touch instead of changing
        // the order-wide license size.
        setOpen(true)
        return
      }
      onSelect(sizes.find((size) => size.value === nextValue))
    },
    [onSelect, sizes]
  )

  return (
    <Fieldset.Root>
      <RadioGroup.Root
        value={value || ''}
        onValueChange={(e) => {
          if (e.value) handleSizeChange(e.value)
        }}
        aria-label='License size options'
        variant={'outline'}
        size={'md'}
      >
        <FieldsetLegend info={info}>
          {label || '3. How big is your company?'}
        </FieldsetLegend>
        <Fieldset.Content asChild>
          <VStack mt={1} gap={1}>
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
                  fontSize={{
                    base: 'lg',
                    xl: 'sm',
                    '2xl': 'md',
                    '3xl': 'lg',
                  }}
                >
                  {size.label}
                </RadioGroup.ItemText>
              </RadioGroup.Item>
            ))}
            <RadioGroup.Item
              cursor={'pointer'}
              onClick={() => setOpen(true)}
              key={'escapeHatch'}
              value={'escapeHatch'}
              py={2}
              px={4}
              w={'full'}
            >
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText
                fontSize={{
                  base: 'lg',
                  xl: 'sm',
                  '2xl': 'md',
                  '3xl': 'lg',
                }}
              >
                {'50+ employees'}
              </RadioGroup.ItemText>
            </RadioGroup.Item>
          </VStack>
        </Fieldset.Content>
      </RadioGroup.Root>
      {children}
      <CustomLicenseMetricDialog open={open} setOpen={setOpen} />
    </Fieldset.Root>
  )
}

export default LicenseSizeRadioList
