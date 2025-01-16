import { useFont } from '@/components/pages/fonts/FontContainer'
import { Box, Flex, Heading } from '@chakra-ui/react'
import { useSpreadContainer } from '../fonts/SpreadContainer'
import Column from './Column'

const RectoVerso: React.FC<{
  label: string
  page: any
  defaultVariantId: string
}> = ({ page, label, defaultVariantId }) => {
  const font = useFont()
  const { padding, conversion, colWidth } = useSpreadContainer()
  return (
    <>
      {font.shortName && (
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
            pt={'0.5rem'}
            pb={'0.25rem'}
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
        page.map((col, idx) => (
          <Column
            key={col.colId}
            {...col}
            defaultVariantId={defaultVariantId}
            conversion={conversion}
            colWidth={colWidth}
          />
        ))}
    </>
  )
}

export default RectoVerso
