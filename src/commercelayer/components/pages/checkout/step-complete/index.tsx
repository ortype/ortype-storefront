import { useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { OrderSummary } from '@/commercelayer/components/pages/checkout/order-summary'
import { PaymentContainer } from '@/commercelayer/components/pages/checkout/step-payment/payment-container'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { CustomAddress } from '@/components/ui/CustomerAddressCard'
import { getTranslations } from '@/components/utils/payments'
import { Box, Button, Container, Flex, Heading, Text } from '@chakra-ui/react'

// Import our own payment source components
import { 
  PaymentSource, 
  PaymentSourceBrandIcon, 
  PaymentSourceBrandName, 
  PaymentSourceDetail 
} from '@/commercelayer/components/payment'

interface Props {
  logoUrl?: string
  companyName: string
  supportEmail?: string
  supportPhone?: string
  orderNumber: number
}

export const StepComplete: React.FC<Props> = ({
  logoUrl,
  companyName,
  supportEmail,
  supportPhone,
  orderNumber,
}) => {
  const { t } = useTranslation()

  const ctx = useContext(CheckoutContext)

  if (!ctx) return null

  const handleClick = () => {
    ctx?.returnUrl && (document.location.href = ctx?.returnUrl)
  }

  return (
    <>
      <Box>
        <Heading>{t('stepComplete.title')}</Heading>
        <Text data-testid="complete-checkout-summary" className="text-gray-400">
          <Trans
            i18nKey={'stepComplete.description'}
            values={{ orderNumber: orderNumber }}
            components={{
              WrapperOrderId: <strong className="text-black" />,
            }}
          />
        </Text>

        {ctx?.returnUrl && (
          <Button data-testid="button-continue-to-shop" onClick={handleClick}>
            {t('stepComplete.continue')}
          </Button>
        )}
      </Box>
      <Box>
        <Box>
          <Box>
            <Box>{t('stepComplete.summary_title')}</Box>
            <OrderSummary checkoutCtx={ctx} readonly />
          </Box>
          <Box>
            <Box>{t('stepComplete.customer_title')}</Box>
            <Box>
              <Heading>{t('stepComplete.email')}</Heading>
              <Text>{ctx.emailAddress}</Text>
            </Box>
            <Box>
              <Container className="lg:!grid-cols-1 xl:!grid-cols-2">
                <div data-testid="billing-address-recap">
                  <Heading>{t('stepComplete.billed_to')}</Heading>
                  <Box>
                    <CustomAddress
                      firstName={ctx.billingAddress?.first_name}
                      lastName={ctx.billingAddress?.last_name}
                      city={ctx.billingAddress?.city}
                      line1={ctx.billingAddress?.line_1}
                      line2={ctx.billingAddress?.line_2}
                      zipCode={ctx.billingAddress?.zip_code}
                      stateCode={ctx.billingAddress?.state_code}
                      countryCode={ctx.billingAddress?.country_code}
                      phone={ctx.billingAddress?.phone}
                      addressType="billing"
                    />
                  </Box>
                </div>
                <>
                  {ctx.isShipmentRequired && (
                    <div data-testid="shipping-address-recap">
                      <Heading>{t('stepComplete.ship_to')}</Heading>
                      <Box>
                        <CustomAddress
                          firstName={ctx.shippingAddress?.first_name}
                          lastName={ctx.shippingAddress?.last_name}
                          city={ctx.shippingAddress?.city}
                          line1={ctx.shippingAddress?.line_1}
                          line2={ctx.shippingAddress?.line_2}
                          zipCode={ctx.shippingAddress?.zip_code}
                          stateCode={ctx.shippingAddress?.state_code}
                          countryCode={ctx.shippingAddress?.country_code}
                          phone={ctx.shippingAddress?.phone}
                          addressType="shipping"
                        />
                      </Box>
                    </div>
                  )}
                </>
              </Container>
            </Box>

            <Box data-testid="payment-recap">
              <Heading>{t('stepComplete.payment')}</Heading>
              {ctx.isPaymentRequired ? (
                <Box>
                  <Flex className="font-bold text-base">
                    <PaymentContainer>
                      <PaymentSource readonly>
                        <PaymentSourceBrandIcon className="mr-2" />
                        <PaymentSourceBrandName className="mr-1">
                          {({ brand }) => {
                            if (ctx.isCreditCard) {
                              return (
                                <Trans i18nKey="stepPayment.endingIn">
                                  {brand}
                                  <PaymentSourceDetail
                                    className="ml-1 font-normal"
                                    type="last4"
                                  />
                                </Trans>
                              )
                            }
                            return <>{getTranslations(brand, t)}</>
                          }}
                        </PaymentSourceBrandName>
                      </PaymentSource>
                    </PaymentContainer>
                  </Flex>
                </Box>
              ) : (
                <Text>{t('stepComplete.free_payment')}</Text>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
