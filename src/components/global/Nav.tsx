import { Account } from '@/commercelayer/components/composite/Account'
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  MenuTriggerItem,
} from '@/components/ui/menu'
import { Box, Button, Flex, For, Group, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useEffect } from 'react'
import { Font } from 'sanity.types'

interface Props {
  fonts: Font[]
}

export const Nav: React.FC<Props> = ({ fonts }) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button variant="square" size="md" bg={'white'}>
          Or
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem asChild value="/">
          <NextLink href={'/'}>{'Or Type'}</NextLink>
        </MenuItem>
        <MenuRoot positioning={{ placement: 'right-start', gutter: 2 }}>
          <MenuTriggerItem value="/typefaces">Type</MenuTriggerItem>
          <MenuContent>
            <For each={fonts}>
              {(item, index) => (
                <MenuItem key={index} value={item.slug} asChild>
                  <NextLink href={`/fonts/${item.slug}`}>
                    {item.shortName}
                  </NextLink>
                </MenuItem>
              )}
            </For>
          </MenuContent>
        </MenuRoot>
        <MenuItem asChild value="/archive">
          <NextLink href={'/archive'}>{'Archive'}</NextLink>
        </MenuItem>
        <MenuItem asChild value="/info">
          <NextLink href={'/info'}>{'Info'}</NextLink>
        </MenuItem>
        <MenuItem asChild value="/info">
          <Account />
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )
}
