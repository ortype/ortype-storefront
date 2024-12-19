import RectoVerso from '@/components/pages/book/RectoVerso'
import Spread from '@/components/pages/book/Spread'
import { Box } from '@chakra-ui/react'

export interface BookModuleProps {
  value: any // @TODO: types
  index: number
}

export default function BookModule({ value, index }: BookModuleProps) {
  const { config, book } = value
  let page = null
  if (book?.snapshots[0]?.spread) {
    // @TODO: thinking left to do on selecting snapshots...
    const spread = JSON.parse(book?.snapshots[0]?.spread)
    page = spread[config.display]
  }

  return (
    book &&
    page && (
      <RectoVerso
        label={config.display}
        page={page}
        defaultVariantId={book.variantId}
      />
    )
  )
}
