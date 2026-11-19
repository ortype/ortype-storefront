import { useFont } from '@/components/pages/fonts/FontContainer'
import { Box, Heading } from '@chakra-ui/react'
import type { ComponentProps } from 'react'
import { useDimensions } from '../fonts/contexts/dimensionsContext'
import Column from './Column'

type BookPageProps = {
  label?: string
  page:
    | (Pick<ComponentProps<typeof Column>, 'width' | 'blocks'> & {
        colId: string
      })[]
    | null
  defaultVariantId: string
}

// Explicit-layout seam for specimens: reuse authored book typography without
// inheriting legacy module sizing or overflow/page-pair state.
export function BookPageContent({
  page,
  defaultVariantId,
  layout: { padding, conversion, colWidth },
  fluid = false,
}: BookPageProps & {
  layout: { padding: string; conversion: number; colWidth: number }
  fluid?: boolean
}) {
  const font = useFont()
  return (
    <>
      {font?.shortName && (
        <Box
          pos={'absolute'}
          top={0}
          right={0}
          left={0}
          style={{
            padding: `0 ${padding}`,
          }}
        >
          <Heading
            pt={fluid ? `${8 * conversion}px` : '0.5rem'}
            pb={fluid ? `${4 * conversion}px` : '0.25rem'}
            borderBottom={'1px solid #000'}
            fontSize={`${13 * conversion}px`}
            lineHeight={`1.5`}
            color={'#000'}
            textAlign={'center'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
          >
            {font.shortName}
          </Heading>
        </Box>
      )}
      {page &&
        page.map((col) => (
          <Column
            key={col.colId}
            {...col}
            defaultVariantId={defaultVariantId}
            conversion={conversion}
            colWidth={colWidth}
            reveal={!fluid}
          />
        ))}
    </>
  )
}

// Legacy callers retain context sizing, fixed header spacing and entry reveals.
const RectoVerso = (props: BookPageProps) => {
  const layout = useDimensions()
  return <BookPageContent {...props} layout={layout} />
}

export default RectoVerso
