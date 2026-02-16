'use client'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import Empty from '@/components/composite/Account/Empty'
import OrderStatusChip from '@/components/composite/Account/Order/OrderStatusChip'
import { formatDate, shortDate } from '@/utils/dateTimeFormats'
import { Link as ChakraLink, Container, Heading, Text } from '@chakra-ui/react'
import { OrderList } from '@commercelayer/react-components/orders/OrderList'
import { OrderListEmpty } from '@commercelayer/react-components/orders/OrderListEmpty'
import { OrderListPaginationButtons } from '@commercelayer/react-components/orders/OrderListPaginationButtons'
import { OrderListPaginationInfo } from '@commercelayer/react-components/orders/OrderListPaginationInfo'
import { OrderListRow } from '@commercelayer/react-components/orders/OrderListRow'
import { flexRender, type Row } from '@tanstack/react-table'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

function OrdersPage(): JSX.Element {
  const { t } = useTranslation()
  const { isLoading, settings } = useIdentityContext()
  if (isLoading || !settings) return <div />

  const colClassName =
    'text-left text-xs font-thin border-b border-gray-200 md:border-none text-gray-300 md:font-semibold md:uppercase md:relative'
  const titleClassName = 'flex gap-2'
  const columns = [
    {
      header: 'Order',
      accessorKey: 'number',
      className: colClassName,
      titleClassName,
    },
    {
      header: 'Date',
      accessorKey: 'placed_at',
      className: colClassName,
      titleClassName,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      className: colClassName,
      titleClassName,
    },
    {
      header: 'Amount',
      accessorKey: 'formatted_total_amount_with_taxes',
      className: colClassName,
      titleClassName,
    },
  ]

  return (
    <>
      <Container>
        <Heading>{t('orders.title')}</Heading>
        <OrderList
          className="w-full mb-8 table-fixed md:-mx-0"
          columns={columns}
          showActions={true}
          loadingElement={<div className="px-5 lg:p-0"></div>}
          actionsContainerClassName="absolute right-1 order-5 align-top hidden md:relative md:align-middle py-5 text-center"
          theadClassName="hidden md:table-row-group"
          rowTrClassName="flex justify-between items-center relative md:content-center bg-white shadow-none mb-4 pb-12 md:pb-0 px-5 md:p-0 md:border-b md:border-gray-300 md:table-row md:shadow-none h-[107px] md:h-[96px]"
          showPagination
          pageSize={15}
          paginationContainerClassName="flex justify-between items-center"
        >
          <OrderListEmpty>{() => <Empty type="Orders" />}</OrderListEmpty>
          <OrderListRow
            field="number"
            className="order-1 pt-6 pb-2.5 md:p-0  md:align-middle"
          >
            {({ cell, row, ...p }) => {
              const order = row?.original
              if (!order) return <></>
              return (
                <>
                  {cell?.map((cell) => {
                    return (
                      <div
                        key={order.number}
                        {...p}
                        // {...cell.getCellProps()}
                      >
                        <ChakraLink
                          as={Link}
                          href={`/account/orders/${order.id}`}
                        >
                          {/*<OrderNumber># {cell.render('Cell')}</OrderNumber>*/}
                          <Text>
                            #{' '}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </Text>
                        </ChakraLink>
                        <Text>
                          {t('orders.orderContains', {
                            count: order.skus_count as number,
                          })}
                        </Text>
                      </div>
                    )
                  })}
                </>
              )
            }}
          </OrderListRow>
          <OrderListRow
            field="placed_at"
            className="absolute order-2 text-right bottom-4 right-5 md:bottom-auto md:relative md:right-auto md:text-left"
          >
            {({ cell, row, ...p }) => {
              const order = row?.original
              if (!order) return <></>
              const cols = cell?.map((cell) => {
                return (
                  <Box
                    key={order.number}
                    {...p}
                    // {...cell.getCellProps()}
                  >
                    <Text>
                      {cell.value && formatDate(cell.value, shortDate)}
                    </Text>
                  </Box>
                )
              })
              return <>{cols}</>
            }}
          </OrderListRow>
          <OrderListRow
            field="status"
            className="absolute order-3 bottom-4 md:bottom-auto md:relative"
          >
            {({ cell, row, ...p }) => {
              const order = row?.original
              if (!order) return <></>
              const cols = cell?.map((cell) => {
                return (
                  <OrderData
                    key={order.number}
                    {...p}
                    // {...cell.getCellProps()}
                  >
                    <OrderStatusChip status={order.status} />
                  </OrderData>
                )
              })
              return <>{cols}</>
            }}
          </OrderListRow>
          <OrderListRow
            field="formatted_total_amount_with_taxes"
            className="order-4 font-bold text-right md:text-left md:text-lg"
          />
          <OrderListPaginationInfo className="text-sm text-gray-500" />
          <OrderListPaginationButtons
            previousPageButton={{
              className:
                'w-[46px] h-[38px] mr-2 border rounded text-sm text-gray-500',
              show: true,
              hideWhenDisabled: true,
            }}
            nextPageButton={{
              className:
                'w-[46px] h-[38px] mr-2 border rounded text-sm text-gray-500',
              show: true,
              hideWhenDisabled: true,
            }}
            navigationButtons={{
              className:
                'w-[46px] h-[38px] mr-2 border rounded text-sm text-gray-500',
              activeClassName:
                'text-gray-500 font-semibold border-black border-2',
            }}
            className="p-2"
          />
        </OrderList>
      </Container>
    </>
  )
}

export default OrdersPage
