'use client'
import { Account } from '@/commercelayer/components/global/account'
import { usePathname } from 'next/navigation'

import type { VisibleFont } from '@/types'
import { Box, Button, Flex, Group } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Nav } from './Nav'
import { SessionId } from './SessionId'

import { useIdentityContext } from '@/commercelayer/providers/identity'
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  MenuTriggerItem,
} from '@/components/ui/menu'
import { useContext, useRef, useState } from 'react'
import { useOrderContext } from 'src/commercelayer/providers/Order'

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
  fonts: VisibleFont[]
}

export const GlobalHeader: React.FC<Props> = ({ fonts }) => {
  // controlled state so we can set an active state on the MenuTrigger button
  const [openMenu, setMenuOpen] = useState(false)
  const [openCart, setCartOpen] = useState(false)
  const [openLogin, setLoginOpen] = useState(false)
  const { orderId, itemsCount } = useOrderContext()
  const pathname = usePathname()

  const hideCart =
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/cart') ||
    !orderId ||
    itemsCount === 0

  // Hide on checkout routes
  const hideLogin = pathname?.startsWith('/checkout')

  const { settings, customer } = useIdentityContext()
  const { full_name } = customer?.metadata
  const firstLetter = full_name?.charAt(0)

  const ref = useRef<HTMLDivElement | null>(null)
  const getAnchorRect = () => ref.current!.getBoundingClientRect()

  return (
    <>
      <SessionId />
      <Nav fonts={fonts} />
      <Group gap={1} p={4} pos={'fixed'} right={0} top={0} zIndex={'docked'}>
        <AnimatePresence mode={'sync'} initial={true}>
          {settings.customerId ? (
            // CUSTOMER
            <motion.div
              key={'customer'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
              }}
            >
              <Button
                bg={'white'}
                color={'black'}
                size={'sm'}
                w={8}
                h={8}
                minW={'auto'}
                border={'2px solid black'}
                // borderRadius={'full'}
                _hover={{
                  bg: 'black',
                  color: 'white',
                }}
                variant={'circle'}
                fontSize={'3xl'}
                className={'fontVariant-Ejdp7jjphH9hhnST6'}
                textTransform={'uppercase'}
                asChild
              >
                <Link href={'/account'}>{firstLetter}</Link>
              </Button>
            </motion.div>
          ) : (
            !hideLogin && (
              // LOGIN
              <motion.div
                key={'login'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.2,
                  ease: 'easeOut',
                }}
              >
                <Button
                  bg={'white'}
                  color={'black'}
                  size={'sm'}
                  fontSize={'md'}
                  px={2}
                  minW={'auto'}
                  borderRadius={'full'}
                  border={'2px solid black'}
                  _hover={{
                    bg: 'black',
                    color: 'white',
                  }}
                  onClick={() => setLoginOpen(true)}
                >
                  {'Login'}
                </Button>
              </motion.div>
            )
          )}

          {!hideCart && (
            <motion.div
              key={'cart'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
              }}
            >
              <DynamicCartContainer
                setMenuOpen={setMenuOpen}
                openMenu={openMenu}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/*<DynamicCartContainer setMenuOpen={setMenuOpen} openMenu={openMenu}>
        <DynamicCart
            openCart={openCart}
            openMenu={openMenu}
            setCartOpen={setCartOpen}
            setMenuOpen={setMenuOpen}
          />
        </DynamicCartContainer>*/}
        {/*<Box ref={ref} pos={'absolute'} bottom={'20px'} right={'20px'}></Box>*/}
      </Group>
      <Account setLoginOpen={setLoginOpen} openLogin={openLogin} />
      {/*
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
      */}
    </>
  )
}
