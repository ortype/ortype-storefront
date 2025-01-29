'use client'
import { OrderContainer } from '@commercelayer/react-components/orders/OrderContainer'
import { OrderNumber } from '@commercelayer/react-components/orders/OrderNumber'
import OrderAccordion from '@/components/composite/Account/Order/OrderAccordion'
import OrderDate from '@/components/composite/Account/Order/OrderDate'
import OrderDownload from '@/components/composite/Account/Order/OrderDownload'
import type { OrderStatus } from '@/components/composite/Account/Order/OrderStatusChip'
import OrderStatusChip from '@/components/composite/Account/Order/OrderStatusChip'
import { SkeletonMainOrder } from '@/components/composite/Account/Skeleton/Main'
import { CustomerContext } from '@/components/data/CustomerProvider'
import { OrderProvider } from '@/components/data/OrderProvider'
import { SettingsContext } from '@/components/data/SettingsProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContext } from 'react'
import { Trans } from 'react-i18next'
import styled from 'styled-components'
import tw from 'twin.macro'
interface OrderWrapperProps {
  hidden?: boolean
}

export const OrderWrapper = styled.div<OrderWrapperProps>`
  ${tw``}
  ${({ hidden }) => hidden && tw`hidden`}
`

export const OrderAccordionWrapper = styled.div`
  ${tw`px-5 w-full md:(px-0)`}
`

export const OrderHeader = styled.div`
  ${tw`flex justify-between mt-3`}
`

export const OrderHeaderMain = styled.div`
  ${tw``}
`

export const OrderTitle = styled.h2`
  ${tw`block text-lg font-medium`}
`

export const OrderHeaderActions = styled.div`
  ${tw`flex justify-end`}
`

export const MobileOnly = styled.div`
  ${tw`md:(hidden)`}
`

export const DesktopOnly = styled.div`
  ${tw`hidden md:(flex gap-2 mt-2)`}
`

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
              <SkeletonMainOrder visible={isLoading} />
              <OrderWrapper hidden={isLoading}>
                <OrderHeader>
                  <OrderHeaderMain>
                    <OrderTitle>
                      <Trans i18nKey="order.title">
                        <OrderNumber />
                      </Trans>
                    </OrderTitle>
                    <OrderDate placed_at={order?.placed_at} />
                    <OrderStatusChip status={order?.status as OrderStatus} />
                    <OrderDownload id={order?.id} />
                  </OrderHeaderMain>
                </OrderHeader>
                <OrderAccordionWrapper>
                  <OrderAccordion />
                </OrderAccordionWrapper>
              </OrderWrapper>
            </OrderContainer>
          )}
        </>
      )}
    </OrderProvider>
  )
}

export default OrderPage
