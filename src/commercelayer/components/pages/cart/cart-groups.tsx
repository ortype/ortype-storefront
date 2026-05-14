import {
  Box,
  Button,
  IconButton as ChakraIconButton,
  Flex,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { CloseIcon } from '@sanity/icons'
import Link from 'next/link'

import { calculateDiscount } from '@/commercelayer/utils/prices'
import type { GroupedLineItems, LineItem } from '.'
import { CartItem } from './cart-item'

interface CartGroupsProps {
  groupedLineItems: GroupedLineItems[]
}

interface CartGroupsFooterProps {
  items: LineItem[]
  parentUid: string
}

const CartGroupsFooter: React.FC<CartGroupsFooterProps> = ({
  parentUid,
  items,
}) => {
  const percentageDiscount = items.length ? calculateDiscount(items.length) : 0

  return (
    <HStack justifyContent={'space-between'} mb={4}>
      <HStack>
        <Button
          asChild
          variant={'outline'}
          bg={'white'}
          borderRadius={'5rem'}
          size={'xs'}
          fontSize={'md'}
          my={4}
        >
          <Link href={`/fonts/${parentUid}/buy`}>{'Add More Styles'}</Link>
        </Button>
        {percentageDiscount === 0 && (
          <Text
            as={Box}
            py={4}
            textAlign={'center'}
            textStyle={'xs'}
            opacity={0.8}
          >
            {`Choose more styles to unlock bundle discounts.`}
          </Text>
        )}
      </HStack>
      <HStack>{`Discount (${percentageDiscount * 100}%)`}</HStack>
    </HStack>
  )
}

const CartGroups: React.FC<CartGroupsProps> = ({ groupedLineItems }) => {
  return (
    <>
      {groupedLineItems.map(
        ({ parentUid, parentName, defaultVariantId, items }) => (
          <VStack gap={0.5} mb={1} key={parentUid} alignItems={'stretch'}>
            <HStack
              py={2}
              px={3}
              bg={'brand.100'}
              w={'full'}
              borderRadius={'full'}
            >
              <ChakraIconButton
                variant="ghost"
                rounded={'full'}
                px={0}
                size={'sm'}
                _hover={{ bg: 'white' }}
                aria-label="Remove"
                css={{
                  '& svg': {
                    color: 'brand.600',
                  },
                }}
              >
                <CloseIcon width={'2rem'} height={'2rem'} />
              </ChakraIconButton>
              <Text
                fontSize={'2xl'}
                lineHeight={1}
                as={'div'}
                className={defaultVariantId}
              >
                {parentName}
              </Text>
            </HStack>
            {items.map((item) => (
              <CartItem key={item.id} lineItem={item} />
            ))}
            <CartGroupsFooter parentUid={parentUid} items={items} />
          </VStack>
        )
      )}
    </>
  )
}

export default CartGroups
