import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { LicenseSize, useOrderContext } from '@/commercelayer/providers/Order'
import { type CompanySize } from '@/sanity/lib/queries'
import { Fieldset, RadioGroup, VStack } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'

interface Props {
  licenseSize: CompanySize
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
}

export const LicenseSizeList: React.FC<Props> = ({
  licenseSize,
  setLicenseSize,
}) => {
  const { companySizes: sizes } = useOrderContext()
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
          <VStack mt={1} gap={1} alignItems={'flex-start'}>
            {sizes.map((size) => (
              <RadioGroup.Item
                key={size.value}
                value={size.value}
                _focus={{
                  ring: 2,
                  ringColor: 'blue.500',
                }}
                bg={'brand.50'}
                _hover={{
                  bg: 'blackAlpha.300',
                  cursor: 'pointer',
                }}
                p={2}
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
          </VStack>
        </Fieldset.Content>
      </RadioGroup.Root>
    </Fieldset.Root>
  )
}
