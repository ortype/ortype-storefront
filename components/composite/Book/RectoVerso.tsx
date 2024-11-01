import { Flex } from '@chakra-ui/react'
import Column from './Column'

const RectoVerso: React.FC<{
  label: string
  editMode: boolean
  pageMargin: number
  conversion: number
  page: any
}> = ({ label, pageMargin, conversion, page, editMode }) => {
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
        paddingTop: `${pageMargin - 14 * conversion}px`,
      }}
    >
      {page &&
        page.map((col, idx) => (
          <Column
            key={col.colId}
            {...col}
            conversion={conversion}
            update={{ page: label, col: idx }}
          />
        ))}
    </Flex>
  )
}

export default RectoVerso
