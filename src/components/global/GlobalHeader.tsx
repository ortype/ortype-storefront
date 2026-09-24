'use client'
import { Account } from '@/commercelayer/components/global/account'
import { usePathname } from 'next/navigation'

import type { VisibleFont } from '@/types'
import { Button, Group } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Nav } from './Nav'
import { SessionId } from './SessionId'

import { useIdentityContext } from '@/commercelayer/providers/identity'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { useState } from 'react'

const DynamicMiniCart: any = dynamic(
  () => import('@/commercelayer/components/global/mini-cart'),
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
  const [openLogin, setLoginOpen] = useState(false)
  const { orderId, itemsCount } = useOrderContext()
  const pathname = usePathname()

  const hideCart =
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/cart') ||
    !orderId ||
    itemsCount === 0

  // Hide on checkout routes
  const hideLogin =
    pathname?.startsWith('/cart') || pathname?.startsWith('/checkout')

  const { settings, customer } = useIdentityContext()
  const { full_name } = customer?.metadata
  const firstLetter = full_name?.charAt(0)

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
                w={10}
                h={10}
                minW={'auto'}
                border={'4px solid black'}
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
                  variant='text'
                  size='sm'
                  fontSize='sm'
                  px={2}
                  py={1}
                  h='auto'
                  minH='auto'
                  minW={'auto'}
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
              <DynamicMiniCart
                setMenuOpen={setMenuOpen}
                openMenu={openMenu}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Group>
      <Account setLoginOpen={setLoginOpen} openLogin={openLogin} />
    </>
  )
}
