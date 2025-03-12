import { Container, LinkOverlay, Wrap, WrapItem } from '@chakra-ui/react'
import Link from 'next/link'

interface PageProps {
  latestPoemEntries: any
}

export default function PoemPage(props: PageProps) {
  const { latestPoemEntries } = props
  return (
    <Container bg={'black'} pt={'5rem'}>
      <Wrap>
        {latestPoemEntries?.map((item) => (
          <WrapItem
            key={item._id}
            className={item.variantId}
            bg={'white'}
            p={2}
            position={'relative'}
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
