import { useTranslation } from 'react-i18next'

import { AddressSectionSaveOnAddressBook } from '../address-section-save-on-address-book'

import { Box } from '@chakra-ui/react'
import { Button } from '@/components/ui/chakra-button'

interface Props {
  addressType: 'billing' | 'shipping'
  hasCustomerAddresses: boolean
  onClick?: () => void
  className?: string
}

export const AddressFormBottom: React.FC<Props> = ({
  addressType,
  hasCustomerAddresses,
  onClick,
  className,
}) => {
  const { t } = useTranslation()

  return (
    <Box className={className}>
      <AddressSectionSaveOnAddressBook addressType={addressType} />
      {hasCustomerAddresses && (
        <Button
          variant="ghost"
          data-testid={`close-${addressType}-form`}
          onClick={onClick}
        >
          {t('stepCustomer.closeForm')}
        </Button>
      )}
    </Box>
  )
}
