import LicenseOwnerRadio from '@/commercelayer/components/forms/license-owner-radio'
import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { useBuyContext } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { Box, Fieldset, GridItem, SimpleGrid } from '@chakra-ui/react'
import React, { useState } from 'react'
import BuySummary from './buy-summary'
import Typefaces from './typefaces'

export const Buy = () => {
  const {
    isLicenseForClient,
    skuOptions,
    setLicenseSize,
    selectedSkuOptions,
    setSelectedSkuOptions,
    allLicenseInfoSet,
    isCreatingOrder,
    buyLabels,
  } = useOrderContext()
  const { font } = useBuyContext()

  // Add to cart / Go to cart button state
  const [isCommitting, setIsCommitting] = useState(false)

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
        opacity={isCreatingOrder || isCommitting ? 0.5 : 1}
        // @NOTE: pointer-events: none does not prevent the font-full, font-group, etc.
        // from accepting click events or hover states
        // pointerEvents={isCreatingOrder || isCommitting ? 'none' : 'auto'}
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
      </Box>
      <BuySummary
        isCommitting={isCommitting}
        setIsCommitting={setIsCommitting}
      />
    </Box>
  )
}

export default Buy
