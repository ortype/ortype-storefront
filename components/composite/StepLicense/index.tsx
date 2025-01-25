import {
  Box,
  Button,
  Fieldset,
  Heading,
  Input,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react'

import { Radio, RadioGroup } from '@/components/ui/radio'

import { Field } from '@/components/ui/field'
// @TODO: Look at exporting this from package
// import { getCountries } from '@commercelayer/react-components/utils/countryStateCity'
import type { Order } from '@commercelayer/sdk'
import classNames from 'classnames'
import { AccordionContext } from 'components/data/AccordionProvider'
import { CheckoutContext, LicenseOwner } from 'components/data/CheckoutProvider'
import { StepContainer } from 'components/ui/StepContainer'
import { StepHeader } from 'components/ui/StepHeader'
import { useRapidForm } from 'rapid-form'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  className?: string
  step: number
}

export interface ShippingToggleProps {
  forceShipping?: boolean
  disableToggle: boolean
}

export const StepHeaderLicense: React.FC<Props> = ({ step }) => {
  const checkoutCtx = useContext(CheckoutContext)
  const accordionCtx = useContext(AccordionContext)
  if (!checkoutCtx || !accordionCtx) {
    return null
  }

  const { hasEmailAddress, emailAddress } = checkoutCtx

  const { t } = useTranslation()

  const recapText = () => {
    if (!hasEmailAddress || accordionCtx.status === 'edit') {
      return (
        <>
          <p>{t('stepLicense.notSet')}</p>
        </>
      )
    }

    return (
      <>
        <p data-testid="Email-email-step-header">{emailAddress}</p>
      </>
    )
  }

  return (
    <StepHeader
      stepNumber={step}
      status={accordionCtx.status}
      label={t('stepLicense.title')}
      info={recapText()}
      onEditRequest={accordionCtx.setStep}
    />
  )
}

export const StepLicense: React.FC<Props> = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const accordionCtx = useContext(AccordionContext)

  const [isLocalLoader, setIsLocalLoader] = useState(false)

  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm()

  const {
    orderId,
    order,
    updateOrder,
    setLicenseOwner,
    isLicenseForClient,
  } = checkoutCtx

  console.log('StepLicense: ', checkoutCtx)

  const [isClient, setIsClient] = useState(isLicenseForClient.toString())

  useEffect(() => {
    setIsClient(isLicenseForClient.toString())
  }, [isLicenseForClient])

  const handleSetIsClient = (value) => {
    setIsClient(value)
  }

  const s = async (values, err, e) => {
    setIsLocalLoader(true)
    // @TODO: How to declare type "LicenseOwner" here
    const isTrueSet = isClient?.toLowerCase?.() === 'true'
    const owner = Object.assign(
          { is_client: isClient?.toLowerCase?.() === 'true' },
          ...Object.keys(values).map((key) => ({ [key]: values[key].value }))
        )

    try {
      const { order: updatedOrder } = await updateOrder({
        id: orderId,
        attributes: {
          metadata: {
            license: {
              ...order.metadata?.license,
              owner,
            },
          },
        },
        // there is an `include` param
      })
      console.log('updatedOrder: ', updatedOrder)

      setLicenseOwner({
        order: updatedOrder,
        licenseOwner: updatedOrder?.metadata?.license?.owner,
      })
    } catch (e) {
      console.log('License updateOrder error: ', e)
    }
    setIsLocalLoader(false)
  }

  if (!checkoutCtx || !accordionCtx) {
    return null
  }

  return (
    <StepContainer
      className={classNames({
        current: accordionCtx.isActive,
        done: !accordionCtx.isActive,
        submitting: isLocalLoader,
      })}
    >
      <Box>
        <>
          {accordionCtx.isActive && (
            <>
              <Fieldset>
                <Field label={'The typeface is being used in a project for'}>
                  <RadioGroup
                    // ref={validation}
                    onChange={handleSetIsClient}
                    name={'is_client'}
                    defaultValue={isClient}
                  >
                    <Stack direction="row">
                      <Radio
                        size={'lg'}
                        value={'false'}
                        defaultChecked={!isClient}
                      >
                        Yourself
                      </Radio>
                      <Radio
                        size={'lg'}
                        value={'true'}
                        defaultChecked={isClient}
                      >
                        Your client
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </Field>
              </Fieldset>
              <form
                as={Box}
                ref={submitValidation}
                autoComplete="off"
                onSubmit={handleSubmit(s)}
              >

                {isClient === 'true' ? (
                  <Text size={'xs'} textTransform={'uppercase'}>{'Client license'}</Text>
                ) : (<Text size={'xs'} textTransform={'uppercase'}>{'Personal license'}</Text>)}
                
                  <>
                    <Fieldset>
                      <Field label={'License Owner/Company*'}>
                        <Input
                          name={'company'}
                          type={'text'}
                          ref={validation}
                          size={'lg'}
                          defaultValue={
                            order?.metadata?.license?.owner?.company
                          }
                        />
                      </Field>
                    </Fieldset>
                    {/*
                    <Fieldset>
                      <Field>{'Name'}</Field>
                      <Input
                        name={'name'}
                        type={'text'}
                        ref={validation}
                        size={'lg'}
                        defaultValue={order?.metadata?.license?.owner?.name}
                      />
                    </Fieldset>*/}

                    <Fieldset>
                      <Field label={'Name'}>
                      <Input
                        name={'full_name'}
                        type={'text'}
                        bg={'#eee'}
                        ref={validation}
                        borderRadius={0}
                        colorPalette={'gray'}
                        variant={'subtle'}
                        size={'lg'}
                        defaultValue={order?.metadata?.license?.owner?.full_name}
                      />
                      </Field>
                    </Fieldset>
                    <Fieldset>
                      <Field label={'Address'}>
                        <Input
                          name={'line_1'}
                          type={'text'}
                          ref={validation}
                          size={'lg'}
                          defaultValue={order?.metadata?.license?.owner?.line_1}
                        />
                      </Field>
                    </Fieldset>
                    <Fieldset>
                      <Field label={'Apartment, suite, etc.'}>
                        <Input
                          name={'line_2'}
                          type={'text'}
                          ref={validation}
                          size={'lg'}
                          defaultValue={order?.metadata?.license?.owner?.line_2}
                        />
                      </Field>
                    </Fieldset>
                    <Fieldset>
                      <Field label={'City*'}>
                        <Input
                          name={'city'}
                          type={'text'}
                          ref={validation}
                          size={'lg'}
                          defaultValue={order?.metadata?.license?.owner?.city}
                        />
                      </Field>
                    </Fieldset>
                    <Fieldset>
                      <Field label={'Zip Code*'}>
                        <Input
                          name={'zip_code'}
                          type={'text'}
                          ref={validation}
                          size={'lg'}
                          defaultValue={
                            order?.metadata?.license?.owner?.zip_code
                          }
                        />
                      </Field>
                    </Fieldset>
                    <Fieldset>
                      <Field label={'Country'}>
                        <Input
                          name={'country_code'}
                          type={'text'}
                          ref={validation}
                          size={'lg'}
                          defaultValue={
                            order?.metadata?.license?.owner?.country_code
                          }
                        />
                      </Field>
                    </Fieldset>
                  </>
                }
                <Button type={'submit'}>Save & proceed</Button>
              </form>
            </>
          )}
        </>
      </Box>
    </StepContainer>
  )
}
