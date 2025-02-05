import { Box, Flex, Heading } from '@chakra-ui/react'
import Column from './Column'

const RectoVerso: React.FC<{
  label: string
  editMode: boolean
  pageMargin: number
  conversion: number
  page: any
  header: string
}> = ({ label, pageMargin, conversion, page, editMode, header }) => {
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
      {header && (
        <Box
          pos={'absolute'}
          top={0}
          right={0}
          left={0}
          style={{
            padding: `0 ${pageMargin * conversion}px`,
          }}
        >
          <Heading
            pt={'0.5rem'}
            pb={'0.25rem'}
            borderBottom={'1px solid #000'}
            size={'xs'}
            color={'#000'}
            textAlign={'center'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
          >
            {header}
          </Heading>
        </Box>
      )}
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
