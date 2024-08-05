import { Box, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'

import { LeaveIcon } from '@sanity/icons'

import { useAuthorizer } from '@authorizerdev/authorizer-react'
import { useRouter } from 'next/navigation'

const Logout: React.FC<{}> = ({}) => {
  const { setUser, setToken, authorizerRef } = useAuthorizer()
  const router = useRouter()
  const handleLogout = async () => {
    setUser(null)
    setToken(null)
    await authorizerRef.logout()
    await fetch('/api/logout')
    router.refresh()
    // @TODO: add a indicator that this is processing
  }

  return (
    <Box>
      <Tooltip hasArrow label="Logout" bg="black" color="white">
        <IconButton
          onClick={handleLogout}
          variant={'outline'}
          // colorScheme={'grey'}
          icon={<LeaveIcon width={'1.5rem'} height={'1.5rem'} />}
          aria-label={''}
        />
      </Tooltip>
    </Box>
  )
}

export default Logout
