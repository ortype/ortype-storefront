import { Flex } from '@chakra-ui/react'
import Column from './Column'

const RectoVerso: React.FC<{
  label: string
  pageMargin: number
  conversion: number
  page: any
  defaultVariantId: string
}> = ({ pageMargin, conversion, page, defaultVariantId }) => {
  return (
    <Flex
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
        padding: `${pageMargin * conversion}px`,
      }}
    >
      {page &&
        page.map((col, idx) => (
          <Column
            key={col.colId}
            {...col}
            defaultVariantId={defaultVariantId}
            conversion={conversion}
          />
        ))}
    </Flex>
  )
}

export default RectoVerso
