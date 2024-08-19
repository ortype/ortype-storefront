import RectoVerso from '@/components/pages/book/RectoVerso'
import Spread from '@/components/pages/book/Spread'
import { Box } from '@chakra-ui/react'

export interface BookModuleProps {
  value: any // @TODO: types
}

export default function BookModule({ value }: BookModuleProps) {
  const { config, book } = value
  let spread = {}
  if (book?.snapshots[0]?.spread) {
    // @TODO: thinking left to do on selecting snapshots...
    spread = JSON.parse(book?.snapshots[0]?.spread)
  }

  console.log('Book Module config: ', config)
  // @TOOD: handle config string values 'recto' or 'verso'... 'spread' is the default

  // `config.display = 'spread' means we want to output two Box/Grid Items

  return (
    <Box bg={'black'}>
      <RectoVerso
        label={config.display}
        page={spread.verso} // depends on config...
        defaultVariantId={book.variantId}
      />
    </Box>
  )
}
