import { Checkbox } from '@/components/ui/checkbox'
import { setCustomerOrderParam } from '@/utils/localStorage'
import { Card } from '@chakra-ui/react'
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

  const storageKey =
    addressType === 'billing'
      ? '_save_billing_address_to_customer_address_book'
      : '_save_shipping_address_to_customer_address_book'

  const handleChange = (e: { checked: boolean }) => {
    setCustomerOrderParam(
      storageKey as '_save_billing_address_to_customer_address_book' | '_save_shipping_address_to_customer_address_book',
      e.checked ? 'true' : 'false'
    )
  }

  return (
    <Card.Root w={'full'}>
      <Card.Body p={3}>
        <Checkbox
          data-testid={dataTestId}
          name={fieldName}
          id={fieldName}
          className="form-checkbox"
          defaultChecked={false}
          onCheckedChange={handleChange}
          variant={'outline'}
          size={'sm'}
        >
          {t('stepCustomer.saveAddressBook')}
        </Checkbox>
      </Card.Body>
    </Card.Root>
  )
}
