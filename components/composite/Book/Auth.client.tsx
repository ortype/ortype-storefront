'use client'
import { useSession } from 'next-auth/react'

import { signIn, signOut } from '@/lib/auth/helpers'
import { AbsoluteCenter, Box, Button } from '@chakra-ui/react'

export default function AuthButton() {
  const session = useSession()

  return session?.data?.user ? (
    <Button
      onClick={async () => {
        await signOut()
        await signIn()
      }}
    >
      {session.data?.user?.name} : Sign Out
    </Button>
  ) : (
    <Box w={'100vw'} h={'100vh'}>
      <AbsoluteCenter>
        <Button
          size={'md'}
          fontWeight={'normal'}
          variant={'outline'}
          onClick={async () => await signIn()}
        >
          Sign In
        </Button>
      </AbsoluteCenter>
    </Box>
  )
}
