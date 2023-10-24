import { Link } from '@chakra-ui/react'
import { CustomerContext } from 'components/data/CustomerProvider'
import { useContext } from 'react'

interface Props {
  id: string
}

function OrderDownload({ id }: Props): JSX.Element {
  const customerContext = useContext(CustomerContext)
  return (
    <>
      <Link
        href={`${process.env.NEXT_PUBLIC_API_URL}/order/${id}/download/${customerContext?.accessToken}`}
      >
        {'Download order'}
      </Link>
    </>
  )
}

export default OrderDownload
