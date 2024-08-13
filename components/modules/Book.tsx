import { Box } from '@chakra-ui/react'
import Spread from '@/components/pages/book/Spread'
import { useFont } from '@/components/pages/fonts/FontContainer'

export interface BookModuleProps {
  value: any // @TODO: types
}

export default function BookModule({ value }: BookModuleProps) {
  let spread
  if (value.book?.snapshots[0]?.spread) {
    spread = JSON.parse(value.book?.snapshots[0]?.spread)
  }

  return (
    <Box bg={'black'}>
      <Spread
        defaultVariantId={value.book.variantId}
        config={value.config}
        spread={spread}
      />
    </Box>
  )
}
