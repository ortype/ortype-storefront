import { Trans } from 'react-i18next'

import { formatDate, shortDate } from '@/utils/dateTimeFormats'
import { Box } from '@chakra-ui/react'

interface Props {
  placed_at?: string
}

function OrderDate({ placed_at }: Props): JSX.Element {
  const orderPlacedAt = (placed_at && formatDate(placed_at, shortDate)) || ''

  return (
    <Box>
      <Trans i18nKey="order.placed_at">{orderPlacedAt}</Trans>
    </Box>
  )
}

export default OrderDate
