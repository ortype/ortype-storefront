import { Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'placed'
  | 'approved'
  | 'cancelled'

interface Props {
  status?: OrderStatus
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

function OrderStatusChip({ status }: Props): JSX.Element {
  const { t } = useTranslation()
  if (status === undefined) return <></>
  return (
    <Box
      // color handlerStatusColor(status)
      className="inline text-sm text-center capitalize text-sm w-auto uppercase font-bold py-[2px] px-[8px] leading-snug rounded-xl align-middle"
    >
      {t(`orderStatus.${status}`) as string}
    </Box>
  )
}

export default OrderStatusChip
