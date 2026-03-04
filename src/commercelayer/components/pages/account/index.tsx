'use client'
import Empty from '@/commercelayer/components/pages/account/empty'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import { Box, Container, Heading, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import OrderList from './order-list'

function OrdersPage(): JSX.Element {
  const { t } = useTranslation()
  const { isLoading, settings } = useIdentityContext()
  if (isLoading || !settings) return <div />
  return (
    <>
      {/*<Heading
        as={'h5'}
        fontSize={'xl'}
        textTransform={'uppercase'}
        fontWeight={'normal'}
        textAlign={'center'}
        mb={2}
      >
        {t('orders.title')}
      </Heading>*/}
      <OrderList />
      {/*<Box bg={'brand.50'} p={4}>
      </Box>*/}
    </>
  )
}

export default OrdersPage
