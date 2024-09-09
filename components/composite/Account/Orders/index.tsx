'use client'
import { Link as ChakraLink } from '@chakra-ui/react'
import { OrderList } from '@commercelayer/react-components/orders/OrderList'
import { OrderListEmpty } from '@commercelayer/react-components/orders/OrderListEmpty'
import { OrderListPaginationButtons } from '@commercelayer/react-components/orders/OrderListPaginationButtons'
import { OrderListPaginationInfo } from '@commercelayer/react-components/orders/OrderListPaginationInfo'
import { OrderListRow } from '@commercelayer/react-components/orders/OrderListRow'
import { flexRender, type Row } from '@tanstack/react-table'
import Empty from 'components/composite/Account/Empty'
import OrderStatusChip from 'components/composite/Account/Order/OrderStatusChip'
import { SkeletonMainOrdersTable } from 'components/composite/Account/Skeleton/Main/OrdersTable'
import { SettingsContext } from 'components/data/SettingsProvider'
import Title from 'components/ui/Account/Title'
import Link from 'next/link'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import tw from 'twin.macro'
import { formatDate, shortDate } from 'utils/dateTimeFormats'

export const StyledOrderList = styled.td`
  ${tw`relative w-full mb-8`}
`

export const OrderListWrapper = styled.div`
  ${tw`-mx-5 md:mx-auto`}
`

export const OrderData = styled.td`
  ${tw``}
`

export const OrderNumber = styled.p`
  ${tw`text-sm font-semibold hover:(cursor-pointer)`}
`

export const OrderItemsCount = styled.p`
  ${tw`text-sm font-light text-gray-400`}
`

export const OrderDate = styled.p`
  ${tw`inline-block text-sm font-extralight text-gray-400 bg-gray-200 px-3 rounded-full h-5 md:(bg-gray-50 px-0 w-min)`}
`

function OrdersPage(): JSX.Element {
  const { t } = useTranslation()
  const { isLoading, settings } = useContext(SettingsContext)
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
      <Title>{t('orders.title')}</Title>
      <OrderListWrapper>
        <OrderList
          className="w-full mb-8 table-fixed md:-mx-0"
          columns={columns}
          showActions={true}
          loadingElement={
            <div className="px-5 lg:p-0">
              <SkeletonMainOrdersTable />
            </div>
          }
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
                      <OrderData
                        key={order.number}
                        {...p}
                        // {...cell.getCellProps()}
                      >
                        <ChakraLink
                          as={Link}
                          href={`/account/orders/${order.id}`}
                        >
                          {/*<OrderNumber># {cell.render('Cell')}</OrderNumber>*/}
                          <OrderNumber>
                            #{' '}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </OrderNumber>
                        </ChakraLink>
                        <OrderItemsCount>
                          {t('orders.orderContains', {
                            count: order.skus_count as number,
                          })}
                        </OrderItemsCount>
                      </OrderData>
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
                  <OrderData
                    key={order.number}
                    {...p}
                    // {...cell.getCellProps()}
                  >
                    <OrderDate>
                      {cell.value && formatDate(cell.value, shortDate)}
                    </OrderDate>
                  </OrderData>
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
      </OrderListWrapper>
    </>
  )
}

export default OrdersPage
