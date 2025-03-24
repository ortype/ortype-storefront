import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  MenuTriggerItem,
} from '@/components/ui/menu'
import { Box, Button, Flex, For, Group, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Font } from 'sanity.types'

interface Props {
  fonts: Font[]
}

export const Nav: React.FC<Props> = ({ fonts }) => {
  // controlled state so we can set an active state on the MenuTrigger button
  const [open, setOpen] = useState(false)

  const ref = useRef<HTMLDivElement | null>(null)
  const getAnchorRect = () => ref.current!.getBoundingClientRect()

  // /typefaces submenu
  // positioning={{ placement: "right-start" }}

  return (
    <MenuRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ getAnchorRect }}
    >
      <MenuTrigger asChild>
        <Button
          pos={'relative'}
          variant="square"
          size="md"
          bg={'white'}
          h={11}
          w={11}
          // onClick={() => setOpen(true)}
          onMouseEnter={() => setOpen(true)}
          // onMouseLeave={handleCloseMenu}
          data-active={open ? 'true' : undefined}
          transition={'none'}
          _hover={{
            bg: 'black',
            color: 'white',
          }}
          asChild
        >
          <NextLink href={'/'}>
            <Text as={'span'} fontSize={'1.5rem'} lineHeight={'1.25rem'}>
              Or
            </Text>
            <Box ref={ref} pos={'absolute'} bottom={'10px'} left={'-3px'}></Box>
          </NextLink>
        </Button>
      </MenuTrigger>
      <MenuContent fontSize={'1.5rem'} onMouseLeave={() => setOpen(false)}>
        <MenuItem asChild value="/" onClick={() => {}}>
          <NextLink href={'/'}>{'Type'}</NextLink>
        </MenuItem>
        {/*<MenuRoot positioning={{ placement: 'right-start', gutter: 2 }}>
          <MenuTriggerItem value="/typefaces">Type</MenuTriggerItem>
          <MenuContent>
            <For each={fonts}>
              {(item, index) => (
                <MenuItem
                  key={index}
                  value={item.slug}
                  asChild
                  onClick={handleCloseMenu}
                >
                  <NextLink href={`/fonts/${item.slug}`}>
                    {item.shortName}
                  </NextLink>
                </MenuItem>
              )}
            </For>
          </MenuContent>
        </MenuRoot>*/}
        <MenuItem asChild value="/archive">
          <NextLink href={'/archive'}>{'Archive'}</NextLink>
        </MenuItem>
        <MenuItem asChild value="/info">
          <NextLink href={'/info'}>{'Info'}</NextLink>
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )
}
