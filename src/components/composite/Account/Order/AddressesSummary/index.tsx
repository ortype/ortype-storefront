import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { CustomerOrderContext } from '@/commercelayer/providers/customer-order'
import { AddressCard } from '@/components/ui/Account/AddressCard'
import { Box, Flex, Heading } from '@chakra-ui/react'

function AddressesSummary(): JSX.Element {
  const { t } = useTranslation()

  const ctx = useContext(CustomerOrderContext)
  const order = ctx?.order

  if (!order || !order?.billing_address || !order?.shipping_address)
    return <></>

  return (
    <Flex direction={'row'} justifyContent={'space-between'} gap={8}>
      <Box>
        <Heading>{t('order.addresses.billedTo')}</Heading>
        <AddressCard
          address={order?.billing_address}
          addressType="billing"
          readonly={true}
        />
      </Box>
      <Box>
        <Heading>{t('order.addresses.shippedTo')}</Heading>
        <AddressCard
          address={order?.shipping_address}
          addressType="shipping"
          readonly={true}
        />
      </Box>
    </Flex>
  )
}

export default AddressesSummary
