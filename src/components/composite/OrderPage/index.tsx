'use client'
import { OrderContainer } from '@commercelayer/react-components/orders/OrderContainer'
import { OrderNumber } from '@commercelayer/react-components/orders/OrderNumber'
import OrderAccordion from '@/components/composite/Account/Order/OrderAccordion'
import OrderDate from '@/components/composite/Account/Order/OrderDate'
import OrderDownload from '@/components/composite/Account/Order/OrderDownload'
import type { OrderStatus } from '@/components/composite/Account/Order/OrderStatusChip'
import OrderStatusChip from '@/components/composite/Account/Order/OrderStatusChip'
import { OrderProvider } from '@/components/data/OrderProvider'
import { SettingsContext } from '@/components/data/SettingsProvider'
import { useContext } from 'react'
import { Trans } from 'react-i18next'
import { Box, Container } from '@chakra-ui/react'

interface OrderWrapperProps {
  hidden?: boolean
}

interface OrderPageProps {
  orderId: string
  // settings: object
}

function OrderPage({ orderId }: OrderPageProps): JSX.Element {
  const { isLoading, settings } = useContext(SettingsContext)
  const accessToken = settings?.accessToken
  const slug = settings?.slug
  if (isLoading || !orderId || !settings) return <div />

  return (
    <OrderProvider
      orderId={orderId}
      accessToken={accessToken as string}
      domain={settings?.domain as string}
      slug={slug as string}
    >
      {({ isInvalid, isLoading, order }) => (
        <>
          {isInvalid ? (
            <div />
          ) : (
            <OrderContainer orderId={orderId}>
              <Container css={{ visibility: isLoading ? 'hidden' : 'visible' }}>
                <Box className={'flex justify-between mt-3'}>
                  <Box>
                    <Box className={'block text-lg font-medium'}>
                      <Trans i18nKey="order.title">
                        <OrderNumber />
                      </Trans>
                    </Box>
                    <OrderDate placed_at={order?.placed_at} />
                    <OrderStatusChip status={order?.status as OrderStatus} />
                    <OrderDownload id={order?.id} />
                  </Box>
                </Box>
                <Box className={'px-5 w-full'}>
                  <OrderAccordion />
                </Box>
              </Container>
            </OrderContainer>
          )}
        </>
      )}
    </OrderProvider>
  )
}

export default OrderPage
