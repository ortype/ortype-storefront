import { useTranslation } from 'react-i18next'

import { getStatusTranslations } from '@/utils/shipments'
import { Box } from '@chakra-ui/react'

export type ShipmentStatus =
  | 'draft'
  | 'upcoming'
  | 'cancelled'
  | 'on_hold'
  | 'picking'
  | 'packing'
  | 'ready_to_ship'
  | 'shipped'

interface Props {
  status?: ShipmentStatus
}

const handlerStatusColor = (status: string) => {
  switch (status) {
    case 'placed': // Orders
    case 'approved': // Orders
    case 'shipped': // Shipments
    case 'received': // Returns
      return `text-green-400 bg-green-400 bg-opacity-10`
    default:
      return `text-yellow-100 bg-yellow-100 bg-opacity-10`
  }
}

function ShipmentStatusChip({ status }: Props): JSX.Element {
  const { t } = useTranslation()
  if (status === undefined) return <></>
  return (
    <Box
      // color handlerStatusColor(status)
      className="inline text-sm text-center capitalize text-sm w-auto uppercase font-bold py-[2px] px-[8px] leading-snug rounded-xl align-middle"
    >
      {getStatusTranslations(status, t)}
    </Box>
  )
}

export default ShipmentStatusChip
