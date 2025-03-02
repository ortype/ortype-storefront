import RectoVerso from '@/components/pages/book/RectoVerso'
import { Box } from '@chakra-ui/react'

export interface BookModuleProps {
  value: any // @TODO: types
  index: number
}

export default function BookModule({ value, index }: BookModuleProps) {
  const { config, book } = value
  let page = null
  if (book?.snapshots?.length > 0) {
    const spread = JSON.parse(
      book.snapshots[Math.floor(Math.random() * book.snapshots.length)]?.spread
    )
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
