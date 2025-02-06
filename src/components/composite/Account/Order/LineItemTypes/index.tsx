import { Box, Flex } from '@chakra-ui/react'
import type { TLineItem } from '@commercelayer/react-components'
import { LineItem } from '@commercelayer/react-components/line_items/LineItem'
import { LineItemAmount } from '@commercelayer/react-components/line_items/LineItemAmount'
import { LineItemCode } from '@commercelayer/react-components/line_items/LineItemCode'
import { LineItemImage } from '@commercelayer/react-components/line_items/LineItemImage'
import { LineItemName } from '@commercelayer/react-components/line_items/LineItemName'
import { LineItemQuantity } from '@commercelayer/react-components/line_items/LineItemQuantity'
import { useTranslation } from 'react-i18next'

interface Props {
  type: TLineItem
}

export function LineItemTypes({ type }: Props): JSX.Element {
  const { t } = useTranslation()

  return (
    <LineItem type={type}>
      <Flex dir="row" w={'100%'} pt={6} pb={8}>
        <LineItemImage className="self-start p-1 border rounded w-[75px] md:w-[85px] bg-gray-50" />
        <Flex justifyContent={'space-between'} pl={4} w={'100%'}>
          <Box>
            <Flex gap={1}>
              SKU <LineItemCode className="text-xs text-gray-600" />
            </Flex>
            <LineItemName className="block mb-1 font-bold" />
            <LineItemQuantity>
              {(props) => (
                <>
                  {!!props.quantity &&
                    t('order.summary.quantity', { count: props.quantity })}
                </>
              )}
            </LineItemQuantity>
          </Box>
          <LineItemAmount className="pt-4 text-lg font-extrabold" />
        </Flex>
      </Flex>
    </LineItem>
  )
}
