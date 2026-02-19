import { useCustomerContext } from '@/commercelayer/providers/customer'
import { formatDate, shortDate } from '@/utils/dateTimeFormats'

import { Link as ChakraLink, Table } from '@chakra-ui/react'
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
  console.log('customer ctx raw:', ctx)

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
      <Table.Root>
        <Table.Header>
          <Table.Row bg={'transparent'}>
            <Table.ColumnHeader>{'Order #'}</Table.ColumnHeader>
            <Table.ColumnHeader>{'Date'}</Table.ColumnHeader>
            <Table.ColumnHeader>{'Status'}</Table.ColumnHeader>
            <Table.ColumnHeader>{'Amount'}</Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {orders?.map((order) => (
            <Table.Row key={order.id} bg={'transparent'}>
              <Table.Cell>{order.number}</Table.Cell>
              <Table.Cell>
                {formatDate(order?.placed_at ?? '', shortDate)}
              </Table.Cell>
              <Table.Cell>
                {order.status}
                {/*order.skus_count*/}
              </Table.Cell>
              <Table.Cell>{`EUR ${order.total_amount_with_taxes_float}`}</Table.Cell>
              <Table.Cell textAlign="end">
                <ChakraLink as={Link} href={`/account/orders/${order.id}`}>
                  {'View'}
                </ChakraLink>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  )
}

export default OrderList
