import LicenseOwnerRadio from '@/commercelayer/components/forms/license-owner-radio'
import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { useBuyContext } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { Box, Fieldset, GridItem, SimpleGrid } from '@chakra-ui/react'
import React from 'react'
import BuySummary from './buy-summary'
import Typefaces from './typefaces'

export const Buy = () => {
  const { isLicenseForClient, skuOptions, setLicenseSize, buyLabels } =
    useOrderContext()
  // License types are part of the per-font draft: they are only promoted to
  // the order-wide default when the font is saved (Add / Update cart).
  const {
    font,
    licenseSkuOptions,
    setLicenseSkuOptions,
    canSelect,
    isCommitting,
  } = useBuyContext()

  return (
    <Box pos={'relative'}>
      <Box
        maxW={['100%']}
        ml={{
          base: '1rem',
          '2xl': '19rem',
          '3xl': '23rem',
        }}
        mr={{
          base: '1rem',
          lg: '18rem',
          '2xl': '19rem',
          '3xl': '23rem',
        }}
        position={'relative'}
        opacity={isCommitting ? 0.5 : 1}
        // @NOTE: pointer-events: none does not prevent the font-full, font-group, etc.
        // from accepting click events or hover states
        // pointerEvents={isCommitting ? 'none' : 'auto'}
        transition={'opacity 200ms ease-out'}
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
              selectedSkuOptions={licenseSkuOptions}
              setSelectedSkuOptions={({ selectedSkuOptions }) =>
                setLicenseSkuOptions(selectedSkuOptions)
              }
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
                pointerEvents={canSelect ? 'auto' : 'none'}
                opacity={canSelect ? 1 : 0.3}
              >
                <Typefaces />
              </Fieldset.Content>
            </Fieldset.Root>
          </GridItem>
        </SimpleGrid>
      </Box>
      <BuySummary />
    </Box>
  )
}

export default Buy
