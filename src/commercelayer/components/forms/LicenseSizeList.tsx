import { LicenseSize } from '@/commercelayer/providers/Order'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { toaster } from '@/components/ui/toaster'
import { Size, sizes } from '@/lib/settings'
import { Fieldset, RadioGroup, VStack } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'

interface Props {
  licenseSize: Size
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
}

export const LicenseSizeList: React.FC<Props> = ({
  licenseSize,
  setLicenseSize,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(
    licenseSize?.value || ''
  )

  // Keep component synced with data from Provider
  useEffect(() => {
    setSelectedSize(licenseSize?.value || '')
  }, [licenseSize])

  const handleSizeChange = useCallback(
    (value: string) => {
      const selectedSize = sizes.find((size) => size.value === value)
      setSelectedSize(value)
      setLicenseSize({ licenseSize: selectedSize })
    },
    [setLicenseSize]
  )

  return (
    <Fieldset.Root>
      <RadioGroup.Root
        value={selectedSize}
        onValueChange={(e) => handleSizeChange(e.value)}
        aria-label="License size options"
        variant={'outline'}
        size={'lg'}
      >
        <FieldsetLegend>{'3. How big is your company?'}</FieldsetLegend>
        <Fieldset.Content asChild>
          <VStack
            mt={1}
            gap={2}
            p={2}
            alignItems={'flex-start'}
            bg={'brand.50'}
          >
            {sizes.map((size) => (
              <RadioGroup.Item
                key={size.value}
                value={size.value}
                _hover={{
                  cursor: 'pointer',
                }}
                _focus={{
                  ring: 2,
                  ringColor: 'blue.500',
                }}
              >
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText fontSize={'xl'}>
                  {size.label}
                </RadioGroup.ItemText>
              </RadioGroup.Item>
            ))}
          </VStack>
        </Fieldset.Content>
      </RadioGroup.Root>
    </Fieldset.Root>
  )
}
