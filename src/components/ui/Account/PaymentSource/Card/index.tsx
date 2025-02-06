import { PaymentSourceBrandIcon } from '@commercelayer/react-components/payment_source/PaymentSourceBrandIcon'
import { PaymentSourceDetail } from '@commercelayer/react-components/payment_source/PaymentSourceDetail'

import {
  PaymentSourceCreditCardExpires,
  PaymentSourceCreditCardNumber,
  PaymentSourceName,
} from '@/components/ui/Account/PaymentSource'
import { Box, Flex, Text } from '@chakra-ui/react'

export function PaymentSourceCard(): JSX.Element {
  return (
    <Flex>
      <Flex>
        <PaymentSourceBrandIcon width={50} />
      </Flex>
      <Box>
        <PaymentSourceDetail type="last4">
          {(props) => {
            if (props.text === null || props.text.length === 0)
              return (
                <Text>
                  <PaymentSourceName />
                </Text>
              )
            return (
              <>
                <Text>
                  <PaymentSourceCreditCardNumber />
                </Text>
                <PaymentSourceCreditCardExpires variant="card" />
              </>
            )
          }}
        </PaymentSourceDetail>
      </Box>
    </Flex>
  )
}
