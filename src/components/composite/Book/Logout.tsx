import { Tooltip } from '@/components/ui/tooltip'
import { signOut } from '@/lib/auth/helpers'
import { Box, IconButton, useDisclosure } from '@chakra-ui/react'
import { LeaveIcon } from '@sanity/icons'

const Logout: React.FC<{}> = ({}) => {
  const handleLogout = async () => {
    await signOut()
  }

  return (
    <Box>
      <Tooltip
        showArrow
        content="Logout"
        contentProps={{ css: { '--tooltip-bg': 'black' } }}
        color="white"
      >
        <IconButton
          onClick={handleLogout}
          variant={'outline'}
          colorScheme={'brand'}
          aria-label={''}
        >
          <LeaveIcon width={'1.5rem'} height={'1.5rem'} />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default Logout
