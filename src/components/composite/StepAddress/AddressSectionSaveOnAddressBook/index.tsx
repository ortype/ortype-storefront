import { Field } from '@/components/ui/field'
import { Flex } from '@chakra-ui/react'
import { AddressInput } from '@commercelayer/react-components'
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
      <Field label={t('stepCustomer.saveAddressBook')}>
        <AddressInput
          data-testid={dataTestId}
          // @ts-expect-error Missing attribute
          name={fieldName}
          id={fieldName}
          type="checkbox"
          required={false}
          className="form-checkbox"
        />
      </Field>
    </Flex>
  )
}
