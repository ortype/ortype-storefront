import { PaymentSourceBrandIcon } from '@commercelayer/react-components/payment_source/PaymentSourceBrandIcon'
import { PaymentSourceDetail } from '@commercelayer/react-components/payment_source/PaymentSourceDetail'

import {
  PaymentSourceCreditCardEndingIn,
  PaymentSourceCreditCardExpires,
  PaymentSourceName,
} from '@/components/ui/Account/PaymentSource'
import { Box, Container, Text } from '@chakra-ui/react'

export function PaymentSourceRow(): JSX.Element {
  return (
    <Container>
      <Box>
        <PaymentSourceBrandIcon width={36} />
      </Box>
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
                  <PaymentSourceName />
                  <PaymentSourceCreditCardEndingIn />
                </Text>
                <PaymentSourceCreditCardExpires variant="row" />
              </>
            )
          }}
        </PaymentSourceDetail>
      </Box>
    </Container>
  )
}
