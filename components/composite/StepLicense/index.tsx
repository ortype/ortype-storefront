import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Switch,
} from '@chakra-ui/react'
import { useOrderContainer } from '@commercelayer/react-components'
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
import { SelectLicenseSize } from './SelectLicenseSize'

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
  const { updateOrder } = useOrderContainer()

  const [isLocalLoader, setIsLocalLoader] = useState(false)

  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm()

  const {
    orderId,
    order,
    billingAddress,
    setLicenseOwner,
    isLicenseForClient,
  } = checkoutCtx

  console.log('StepLicense: ', checkoutCtx)

  const [isClient, setIsClient] = useState(isLicenseForClient.toString())

  useEffect(() => {
    setIsClient(isLicenseForClient.toString())
  }, [isLicenseForClient])

  // @TODO: store is_client param in state

  const handleSetIsClient = (value) => {
    setIsClient(value)
  }

  const s = async (values, err, e) => {
    setIsLocalLoader(true)
    // @TODO: How to declare type "LicenseOwner" here
    const isTrueSet = isClient?.toLowerCase?.() === 'true'
    const owner = isTrueSet
      ? Object.assign(
          { is_client: isClient },
          ...Object.keys(values).map((key) => ({ [key]: values[key].value }))
        )
      : {
          is_client: isClient,
          full_name: billingAddress.full_name,
        }

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
              <FormControl>
                <FormLabel>
                  {'The typeface is being used in a project for'}
                </FormLabel>
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
                    <Radio size={'lg'} value={'true'} defaultChecked={isClient}>
                      Your client
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
              <FormControl>
                <FormLabel>{'Company size of the license owner'}</FormLabel>
                <SelectLicenseSize />
              </FormControl>
              <form
                as={Box}
                ref={submitValidation}
                autoComplete="off"
                onSubmit={handleSubmit(s)}
              >
                {isClient === 'true' && (
                  <>
                    <FormControl>
                      <FormLabel>{'License Owner/Company*'}</FormLabel>
                      <Input
                        name={'company'}
                        type={'text'}
                        ref={validation}
                        size={'lg'}
                        defaultValue={order?.metadata?.license?.owner?.company}
                      />
                    </FormControl>
                    {/*
                    <FormControl>
                      <FormLabel>{'Name'}</FormLabel>
                      <Input
                        name={'name'}
                        type={'text'}
                        ref={validation}
                        size={'lg'}
                        defaultValue={order?.metadata?.license?.owner?.name}
                      />
                    </FormControl>*/}
                    <FormControl>
                      <FormLabel>{'First name'}</FormLabel>
                      <Input
                        name={'first_name'}
                        type={'text'}
                        ref={validation}
                        size={'lg'}
                        defaultValue={
                          order?.metadata?.license?.owner?.first_name
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{'Last name'}</FormLabel>
                      <Input
                        name={'last_name'}
                        type={'text'}
                        ref={validation}
                        size={'lg'}
                        defaultValue={
                          order?.metadata?.license?.owner?.last_name
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>{'Address'}</FormLabel>
                      <Input
                        name={'line_1'}
                        type={'text'}
                        ref={validation}
                        size={'lg'}
                        defaultValue={order?.metadata?.license?.owner?.line_1}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{'Apartment, suite, etc.'}</FormLabel>
                      <Input
                        name={'line_2'}
                        type={'text'}
                        ref={validation}
                        size={'lg'}
                        defaultValue={order?.metadata?.license?.owner?.line_2}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{'City*'}</FormLabel>
                      <Input
                        name={'city'}
                        type={'text'}
                        ref={validation}
                        size={'lg'}
                        defaultValue={order?.metadata?.license?.owner?.city}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{'Zip Code*'}</FormLabel>
                      <Input
                        name={'zip_code'}
                        type={'text'}
                        ref={validation}
                        size={'lg'}
                        defaultValue={order?.metadata?.license?.owner?.zip_code}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{'Country'}</FormLabel>
                      <Input
                        name={'country_code'}
                        type={'text'}
                        ref={validation}
                        size={'lg'}
                        defaultValue={
                          order?.metadata?.license?.owner?.country_code
                        }
                      />
                    </FormControl>
                  </>
                )}
                <Button type={'submit'}>Save & proceed</Button>
              </form>
            </>
          )}
        </>
      </Box>
    </StepContainer>
  )
}
