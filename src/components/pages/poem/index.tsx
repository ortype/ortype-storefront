import { Container, LinkOverlay, Wrap, WrapItem } from '@chakra-ui/react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
interface PageProps {
  latestPoemEntries: any
}

export default function PoemPage(props: PageProps) {
  const { latestPoemEntries } = props
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [latestPoemEntries])

  return (
    <Container ref={containerRef} py={'5rem'} px={'5rem'} maxW={'6xl'}>
      <Wrap gap={'0.2rem'}>
        {latestPoemEntries?.map((item) => (
          <WrapItem
            key={item._id}
            className={item.variantId}
            position={'relative'}
            lineHeight={1}
          >
            <LinkOverlay
              asChild
              fontSize={'2xl'}
              lineHeight={'1.2'}
              bg={
                item.sessionId === sessionStorage.getItem('sessionId')
                  ? 'brand.300'
                  : 'white'
              }
              py={2}
              px={4}
              _hover={{
                bg: 'black',
                color: 'white',
              }}
            >
              <Link href={`fonts/${item.slug}`}>{`${item.entry}`}</Link>
            </LinkOverlay>
          </WrapItem>
        ))}
      </Wrap>
    </Container>
  )
}
