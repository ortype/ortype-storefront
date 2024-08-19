import { Flex } from '@chakra-ui/react'
import { useSpreadContainer } from '../fonts/SpreadContainer'
import Column from './Column'

const RectoVerso: React.FC<{
  label: string
  page: any
  defaultVariantId: string
}> = ({ page, label, defaultVariantId }) => {
  const { padding, conversion, colWidth } = useSpreadContainer()
  return (
    <Flex
      className={`page-${label}`}
      w={'100%'}
      h={'100%'}
      bg={'#FFF'}
      position={'absolute'}
      top={0}
      left={0}
      bottom={0}
      right={0}
      wrap={'wrap'}
      alignContent={'flex-start'}
      style={{
        padding,
      }}
    >
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
    </Flex>
  )
}

export default RectoVerso
