import { ParcelField } from '@commercelayer/react-components/parcels/ParcelField'
import { ParcelLineItem } from '@commercelayer/react-components/parcels/ParcelLineItem'
import { ParcelLineItemField } from '@commercelayer/react-components/parcels/ParcelLineItemField'
import { ParcelLineItemsCount } from '@commercelayer/react-components/parcels/ParcelLineItemsCount'
import { Parcels } from '@commercelayer/react-components/parcels/Parcels'
import { Shipment } from '@commercelayer/react-components/shipments/Shipment'
import { ShipmentField } from '@commercelayer/react-components/shipments/ShipmentField'
import { ShipmentsContainer } from '@commercelayer/react-components/shipments/ShipmentsContainer'
import { ShipmentsCount } from '@commercelayer/react-components/shipments/ShipmentsCount'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import type { ShipmentStatus } from '@/components/composite/Account/Order/ShipmentStatusChip'
import ShipmentStatusChip from '@/components/composite/Account/Order/ShipmentStatusChip'
import { OrderContext } from '@/components/data/OrderProvider'
import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react'

import { useIdentityContext } from '@/commercelayer/providers/Identity'
import {
    AccordionItem,
    AccordionItemContent,
    AccordionItemTrigger,
    AccordionRoot,
} from '@/components/ui/chakra-accordion'

function ParcelTrackingNumber(): JSX.Element {
  return (
    <Box className="relative pl-10 mr-10 hidden md:block">
      <Box className="absolute right-0 font-bold text-right text-gray-300 uppercase -top-5 text-[12px]">
        <Trans i18nKey="order.shipments.trackingCode" />
      </Box>
      <Text>
        <ParcelField attribute="tracking_number" tagElement="span" />
      </Text>
    </Box>
  )
}

function ParcelLink(): JSX.Element {
  // const [, setLocation] = useLocation()
  const router = useRouter()

  const {} = useRouter()

  const { t } = useTranslation()
  const ctx = useIdentityContext()
  const accessToken = ctx?.settings?.accessToken
  const orderCtx = useContext(OrderContext)
  const orderId = orderCtx?.order?.id
  return (
    <ParcelField attribute="id" tagElement="span">
      {(props: any) => {
        return (
          <Button
            className="uppercase"
            size={'sm'}
            onClick={() =>
              router.push(`/orders/${orderId}/parcels/${props?.attributeValue}`)
            }
          >{t('order.shipments.trackParcel'}</Button>
        )
      }}
    </ParcelField>
  )
}

function Parcel(): JSX.Element {
  return (
    <Box py="2" pl="7">
      <Flex justifyContent={'space-between'}>
        <Heading className='relative pr-4 text-sm font-bold before:(bg-[#e6e7e7] content-[""] h-[1px] w-[20px] absolute top-[50%] left-[-28px]) max-w-max md:max-w-full break-all'>
          <Trans i18nKey="order.shipments.parcel">
            <ParcelField attribute="number" tagElement="span" />
          </Trans>
        </Heading>
        <Flex>
          <ParcelTrackingNumber />
          <ParcelLink />
        </Flex>
      </Flex>
      <Box py={3}>
        <ParcelLineItemsCount>
          {(props) => {
            const itemsCounterToString = props.itemsCounter.toString()
            const showHideMenuButtonTextLabel =
              props.itemsCounter > 1
                ? 'showHideMenu.mainLabel_plural'
                : 'showHideMenu.mainLabel'
            return (
              <AccordionRoot value={['1']}>
                <AccordionItem value={'1'}>
                  <AccordionItemTrigger>
                    <Trans i18nKey={showHideMenuButtonTextLabel}>
                      {itemsCounterToString}
                    </Trans>
                  </AccordionItemTrigger>
                  <AccordionItemContent>
                    <ParcelLineItem>
                      <Flex direction={'row'} py={4}>
                        <Box>
                          <ParcelLineItemField
                            tagElement="img"
                            attribute="image_url"
                          />
                        </Box>
                        <Flex direction="column">
                          <Text>
                            <ParcelLineItemField
                              tagElement="span"
                              attribute="name"
                            />
                          </Text>
                          <Text>
                            <Trans i18nKey="order.shipments.parcelLineItemQuantity">
                              <ParcelLineItemField
                                tagElement="span"
                                attribute="quantity"
                              />
                            </Trans>
                          </Text>
                        </Flex>
                      </Flex>
                    </ParcelLineItem>
                  </AccordionItemContent>
                </AccordionItem>
              </AccordionRoot>
            )
          }}
        </ParcelLineItemsCount>
      </Box>
    </Box>
  )
}

function ShipmentTop(): JSX.Element {
  return (
    <Flex>
      <Heading>
        <ShipmentField name="key_number" />/<ShipmentsCount />
      </Heading>
      <Box pos={'relative'} ml={3}>
        <Flex alignItems={'center'}>
          <Text>
            <Trans i18nKey="order.shipments.shipment">
              <ShipmentField name="number" />
            </Trans>
          </Text>
          <ShipmentField name="number">
            {(props) => {
              return (
                <ShipmentStatusChip
                  status={props?.shipment?.status as ShipmentStatus}
                />
              )
            }}
          </ShipmentField>
        </Flex>
        <ShipmentField name="number">
          {(props) => {
            return (
              <Box className="absolute left-0 text-sm text-gray-500 -bottom-5">
                {props?.shipment?.shipping_method?.name}
              </Box>
            )
          }}
        </ShipmentField>
      </Box>
    </Flex>
  )
}

function OrderShipments(): JSX.Element {
  return (
    <ShipmentsContainer>
      <Shipment>
        <Box>
          <ShipmentTop />
          <Parcels>
            <Box>
              <Parcel />
            </Box>
          </Parcels>
        </Box>
      </Shipment>
    </ShipmentsContainer>
  )
}

export default OrderShipments
