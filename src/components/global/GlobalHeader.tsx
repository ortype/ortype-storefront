'use client'
import { Account } from '@/commercelayer/components/global/account'
import { IconButton } from '@/components/ui/chakra-iconbutton'
import { Box, Button, Flex, Group } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Font } from 'sanity.types'
import { Nav } from './Nav'
import { SessionId } from './SessionId'

import { useIdentityContext } from '@/commercelayer/providers/Identity'
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  MenuTriggerItem,
} from '@/components/ui/menu'
import { useContext, useRef, useState } from 'react'

const DynamicCartContainer: any = dynamic(
  () => import('@/commercelayer/components/pages/cart/container'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)
const DynamicCart: any = dynamic(
  () => import('@/commercelayer/components/pages/cart/dialog'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

interface Props {
  fonts: Font[]
}

export const GlobalHeader: React.FC<Props> = ({ fonts }) => {
  // controlled state so we can set an active state on the MenuTrigger button
  const [openMenu, setMenuOpen] = useState(false)
  const [openCart, setCartOpen] = useState(false)
  const [openLogin, setLoginOpen] = useState(false)

  const { settings } = useIdentityContext()

  const ref = useRef<HTMLDivElement | null>(null)
  const getAnchorRect = () => ref.current!.getBoundingClientRect()

  return (
    <>
      <SessionId />
      <Box p={4} pos={'fixed'} left={0} top={0} zIndex={'docked'}>
        <Nav fonts={fonts} />
      </Box>
      <Box p={4} pos={'fixed'} right={0} top={0} zIndex={'docked'}>
        <DynamicCartContainer setMenuOpen={setMenuOpen} openMenu={openMenu}>
          {/*<DynamicCart
            openCart={openCart}
            openMenu={openMenu}
            setCartOpen={setCartOpen}
            setMenuOpen={setMenuOpen}
          />*/}
        </DynamicCartContainer>
        <Box ref={ref} pos={'absolute'} bottom={'20px'} right={'20px'}></Box>
      </Box>
      <Account setLoginOpen={setLoginOpen} openLogin={openLogin} />
      <MenuRoot
        open={openMenu}
        onOpenChange={(e) => setMenuOpen(e.open)}
        positioning={{ getAnchorRect }}
        variant={'right'}
      >
        <MenuContent
          fontSize={'1.5rem'}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <MenuItem asChild value="#">
            <Button
              variant={'plain'}
              // onClick={() => setCartOpen(true)}
              asChild
            >
              <Link href={'/cart'}>{`Cart`}</Link>
            </Button>
          </MenuItem>
          <MenuItem asChild value="/account">
            <Button onClick={() => setLoginOpen(true)} variant={'plain'}>
              {settings.customerId ? `Account` : `Login`}
            </Button>
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </>
  )
}
