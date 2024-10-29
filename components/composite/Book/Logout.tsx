import { signOut } from '@/lib/auth/helpers'
import { Box, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'
import { LeaveIcon } from '@sanity/icons'

const Logout: React.FC<{}> = ({}) => {
  const handleLogout = async () => {
    await signOut()
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
