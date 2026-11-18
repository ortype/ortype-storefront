'use client'
import { CustomerOrderProvider } from '@/commercelayer/providers/customer-order'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import { Button, HStack, VStack } from '@chakra-ui/react'
import { FontLicenses } from './font-licenses'
import { LicenseSummary } from './license-summary'
import { OrderSummary } from './summary'

interface OrderPageProps {
  orderId: string
  // settings: object
}

function OrderPage({ orderId }: OrderPageProps): JSX.Element {
  const { isLoading, settings, config } = useIdentityContext()
  const accessToken = settings?.accessToken
  const slug = config?.slug
  if (isLoading || !orderId || !settings) return <div />

  return (
    <CustomerOrderProvider
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
            <>
              <VStack gap={6} w={'full'} alignItems={'flex-start'}>
                <OrderSummary order={order} />
                <HStack w={'full'} gap={2} justifyContent={'center'}>
                  <Button
                    variant={'solid'}
                    bg={'red'}
                    borderRadius={'5rem'}
                    size={'sm'}
                    fontSize={'md'}
                    color={'white'}
                    gap={1}
                    _hover={{ bg: 'black' }}
                  >
                    {'Download Fonts'}
                  </Button>
                  <Button
                    variant={'solid'}
                    bg={'red'}
                    borderRadius={'5rem'}
                    size={'sm'}
                    fontSize={'md'}
                    color={'white'}
                    gap={1}
                    _hover={{ bg: 'black' }}
                  >
                    {'Download Invoice'}
                  </Button>
                </HStack>
                <FontLicenses order={order} />
                <LicenseSummary
                  owner={order?.metadata?.license?.owner}
                  size={order?.metadata?.license?.size}
                />
              </VStack>
              {/*
                <OrderDownload />
                {order?.id}
                ${process.env.NEXT_PUBLIC_API_URL}/order/${id}/download/${settings?.accessToken}
              */}
            </>
          )}
        </>
      )}
    </CustomerOrderProvider>
  )
}

export default OrderPage
