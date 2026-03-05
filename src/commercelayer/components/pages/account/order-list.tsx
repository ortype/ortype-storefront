import { useCustomerContext } from '@/commercelayer/providers/customer'
import { formatDate, shortDate } from '@/utils/dateTimeFormats'
import { useRouter } from 'next/navigation'

import { Badge, Link as ChakraLink, Table } from '@chakra-ui/react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
export type TOrderList = 'orders' | 'subscriptions'

interface Props {
  /**
   * Type of list to render
   */
  type?: TOrderList
  id?: string
}

function OrderList({ id, type = 'orders' }: Props): JSX.Element {
  const { orders, subscriptions, getCustomerOrders, getCustomerSubscriptions } =
    useCustomerContext()
  const ctx = useCustomerContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (type === 'orders' && getCustomerOrders != null) {
      getCustomerOrders({
        pageNumber: 1,
        pageSize: 24,
      })
    }
    if (type === 'subscriptions' && getCustomerSubscriptions != null) {
      getCustomerSubscriptions({
        pageNumber: 1,
        pageSize: 24,
        id,
      })
    }
  }, [id != null])

  const data = useMemo(() => {
    if (type === 'orders') {
      return orders ?? []
    }

    if (id == null) {
      return subscriptions ?? []
    }

    if (subscriptions?.[0]?.type === 'orders') {
      return subscriptions
    }

    return []
  }, [orders, subscriptions])

  return (
    <>
      <Table.Root variant={'custom'} size={'sm'} interactive>
        <Table.Header>
          <Table.Row bg={'transparent'}>
            <Table.ColumnHeader>{'Order #'}</Table.ColumnHeader>
            <Table.ColumnHeader>{'Licensee'}</Table.ColumnHeader>
            <Table.ColumnHeader>{'Date'}</Table.ColumnHeader>
            {/*<Table.ColumnHeader>{'Items'}</Table.ColumnHeader>*/}
            <Table.ColumnHeader>{'Status'}</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">{'Amount'}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {orders?.map((order) => (
            <Table.Row
              key={order.id}
              cursor={'pointer'}
              onClick={() => router.push(`/account/purchases/${order.id}`)}
            >
              <Table.Cell fontSize={'sm'}>{order.number}</Table.Cell>
              <Table.Cell>
                {order?.metadata?.license?.owner?.full_name}
              </Table.Cell>
              <Table.Cell>
                {formatDate(order?.placed_at ?? '', shortDate)}
              </Table.Cell>
              {/*<Table.Cell>{order.skus_count}</Table.Cell>*/}
              <Table.Cell>
                <Badge
                  variant={'outline'}
                  size={'sm'}
                  fontFamily={'Alltaf-Bold'}
                  colorPalette={
                    order.payment_status === 'paid' ? 'green' : 'gray'
                  }
                  // bg={
                  //   order.payment_status === 'paid'
                  //     ? 'green.400'
                  //     : 'colorPalette.bg'
                  // }
                  /*
                  The order payment status.
                  One of 'unpaid' (default), 'authorized', 'partially_authorized', 'paid', 'partially_paid', 'voided', 'partially_voided', 'refunded', 'partially_refunded', or 'free'.
                  */
                >
                  {order.payment_status}
                </Badge>
              </Table.Cell>
              <Table.Cell textAlign="end">{`EUR ${order.total_amount_with_taxes_float}`}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  )
}

export default OrderList
