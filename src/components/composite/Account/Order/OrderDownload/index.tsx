import { useIdentityContext } from '@/commercelayer/providers/identity'
import { Link } from '@chakra-ui/react'

interface Props {
  id: string
}

function OrderDownload({ id }: Props): JSX.Element {
  const { settings } = useIdentityContext()
  return (
    <>
      <Link
        href={`${process.env.NEXT_PUBLIC_API_URL}/order/${id}/download/${settings?.accessToken}`}
      >
        {'Download order'}
      </Link>
    </>
  )
}

export default OrderDownload
