import { Field } from '@/components/ui/field'
import { Flex } from '@chakra-ui/react'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from 'react-i18next'

interface Props {
  addressType: 'billing' | 'shipping'
}

export const AddressSectionSaveOnAddressBook: React.FC<Props> = ({
  addressType,
}) => {
  const { t } = useTranslation()

  const fieldName =
    addressType === 'billing'
      ? 'billing_address_save_to_customer_book'
      : 'shipping_address_save_to_customer_book'
  const dataTestId =
    addressType === 'billing'
      ? 'billing_address_save_to_customer_address_book'
      : 'shipping_address_save_to_customer_address_book'

  return (
    <Flex className="items-center">
      <Checkbox
        data-testid={dataTestId}
        name={fieldName}
        id={fieldName}
        label={t('stepCustomer.saveAddressBook')}
      />
    </Flex>
  )
}
