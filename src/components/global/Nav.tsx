import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  MenuTriggerItem,
} from '@/components/ui/menu'
import {
  Box,
  Button,
  Flex,
  For,
  Group,
  Link,
  Show,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Font } from 'sanity.types'

interface Props {
  fonts: Font[]
}

export const Nav: React.FC<Props> = ({ fonts }) => {
  // main menu
  const [openMenu, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const getAnchorRect = () => ref.current!.getBoundingClientRect()

  // type trigger
  const [typeTrigger, showTypeTrigger] = useState(false)
  const typeRef = useRef<HTMLDivElement | null>(null)
  const getTypeAnchorRect = () => typeRef.current!.getBoundingClientRect()

  // type sub-menu
  const [openTypeMenu, setTypeMenuOpen] = useState(false)
  const pathname = usePathname()
  const [currentFont, setCurrentFont] = useState<Font | null>(null)

  useEffect(() => {
    const isFontPath = pathname.includes('fonts/')
    if (isFontPath) {
      const slug: string = pathname.split('/').filter(Boolean).pop() || ''
      const currentFont = fonts.find((font) => font.slug === slug)
      if (currentFont) {
        setCurrentFont(currentFont)
        showTypeTrigger(true)
      }
    } else {
      setCurrentFont(null)
      showTypeTrigger(false)
    }
  }, [pathname, showTypeTrigger, fonts])

  // Create a sorted version of fonts array with current font first if it exists
  const sortedFonts = useMemo(() => {
    const sorted = [...fonts]
    if (currentFont) {
      const currentFontIndex = sorted.findIndex(
        (font) => font.slug === currentFont.slug
      )

      if (currentFontIndex > -1) {
        const [currentFontItem] = sorted.splice(currentFontIndex, 1)
        sorted.unshift(currentFontItem)
      }
    }
    return sorted
  }, [fonts, currentFont])

  return (
    <>
      <Flex pos={'relative'}>
        <Button
          pos={'relative'}
          variant="square"
          size="md"
          bg={'white'}
          h={11}
          w={11}
          onMouseEnter={() => {
            setMenuOpen(true)
            showTypeTrigger(true)
            setTypeMenuOpen(false)
          }}
          data-active={openMenu ? 'true' : undefined}
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
            <Box ref={ref} pos={'absolute'} bottom={'8px'} left={'-3px'}></Box>
          </NextLink>
        </Button>

        <Show when={currentFont || typeTrigger} fallback={<></>}>
          <Button
            ml={'-3px'}
            p={2}
            variant={'square'}
            fontSize={'1.5rem'}
            lineHeight={'1.25rem'}
            h={11}
            onMouseEnter={() => {
              setTypeMenuOpen(true)
              setMenuOpen(false)
            }}
            className={currentFont ? currentFont.defaultVariant?._id : ''}
          >
            {currentFont ? currentFont.shortName : 'Type'}
            <Box
              ref={typeRef}
              pos={'absolute'}
              top={'-11px'}
              left={'0px'}
            ></Box>
          </Button>
        </Show>
        <MenuRoot
          variant={'wrap'}
          open={openTypeMenu}
          onOpenChange={(e) => setTypeMenuOpen(e.open)}
          positioning={{ getAnchorRect: getTypeAnchorRect }}
        >
          <MenuContent
            maxW={'60vw'}
            onMouseLeave={() => {
              setTypeMenuOpen(false)
              showTypeTrigger(false)
            }}
          >
            <For each={sortedFonts}>
              {(item, index) => (
                <MenuItem
                  key={index}
                  value={item.slug}
                  className={item.defaultVariant?._id}
                  fontSize={'1.5rem'}
                  lineHeight={'1.25rem'}
                >
                  <Box whiteSpace={'nowrap'} asChild>
                    <NextLink href={`/fonts/${item.slug}`}>
                      {item.shortName}
                    </NextLink>
                  </Box>
                </MenuItem>
              )}
            </For>
          </MenuContent>
        </MenuRoot>
        <MenuRoot
          open={openMenu}
          onOpenChange={(e) => setMenuOpen(e.open)}
          positioning={{ getAnchorRect }}
        >
          <MenuContent
            fontSize={'1.5rem'}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <MenuItem asChild value="/archive">
              <NextLink href={'/archive'}>{'Archive'}</NextLink>
            </MenuItem>
            <MenuItem asChild value="/info">
              <NextLink href={'/info'}>{'Info'}</NextLink>
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </Flex>
    </>
  )
}
