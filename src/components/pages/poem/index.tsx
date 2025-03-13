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
      <Wrap>
        {latestPoemEntries?.map((item) => (
          <WrapItem
            key={item._id}
            className={item.variantId}
            bg={
              item.sessionId === sessionStorage.getItem('sessionId')
                ? 'red'
                : 'white'
            }
            p={2}
            position={'relative'}
            lineHeight={1}
          >
            <LinkOverlay asChild>
              <Link href={`fonts/${item.slug}`}>{`${item.entry}`}</Link>
            </LinkOverlay>
          </WrapItem>
        ))}
      </Wrap>
    </Container>
  )
}
