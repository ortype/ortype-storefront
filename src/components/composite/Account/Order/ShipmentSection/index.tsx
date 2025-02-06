import { Text } from '@chakra-ui/react'
import { Shipment } from '@commercelayer/react-components/shipments/Shipment'
import { ShipmentField } from '@commercelayer/react-components/shipments/ShipmentField'
import { ShipmentsContainer } from '@commercelayer/react-components/shipments/ShipmentsContainer'
import { Trans, useTranslation } from 'react-i18next'

function ShipmentSection(): JSX.Element {
  const { t } = useTranslation()

  return (
    <ShipmentsContainer>
      <Shipment>
        <Text>
          <Trans t={t} i18nKey="order.shipments.shipment">
            <ShipmentField name="key_number" />
          </Trans>
        </Text>
        <Text>
          <Trans t={t} i18nKey="order.shipments.shipmentStatus">
            <ShipmentField name="status" />
          </Trans>
        </Text>
      </Shipment>
    </ShipmentsContainer>
  )
}

export default ShipmentSection
