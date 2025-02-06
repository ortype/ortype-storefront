import { useTranslation } from 'react-i18next'

import AddressesSummary from '@/components/composite/Account/Order/AddressesSummary'
import LineItemList from '@/components/composite/Account/Order/LineItemList'
import OrderPayments from '@/components/composite/Account/Order/OrderPayments'
import OrderShipments from '@/components/composite/Account/Order/OrderShipments'
import OrderSummary from '@/components/composite/Account/Order/OrderSummary'
import { Box, Tabs } from '@chakra-ui/react'

function OrderSections(): JSX.Element {
  const { t } = useTranslation()

  return (
    <Box mt={12}>
      <Tabs.Root>
        <Tabs.List>
          <Tabs.Trigger value={'1'}>
            <span>{t('order.summary.title')}</span>
          </Tabs.Trigger>
          <Tabs.Trigger value={'2'}>
            <span>{t('order.addresses.title')}</span>
          </Tabs.Trigger>
          <Tabs.Trigger value={'3'}>
            <span>{t('order.shipments.title')}</span>
          </Tabs.Trigger>
          <Tabs.Trigger value={'4'}>
            <span>{t('order.payments.title')}</span>
          </Tabs.Trigger>

          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Content value={'1'}>
          <LineItemList />
          <OrderSummary />
        </Tabs.Content>
        <Tabs.Content value={'2'}>
          <AddressesSummary />
        </Tabs.Content>
        <Tabs.Content value={'3'}>
          <OrderShipments />
        </Tabs.Content>
        <Tabs.Content value={'3'}>
          <OrderPayments />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}

export default OrderSections
