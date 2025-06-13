import {
  Box,
  Button,
  Fieldset,
  Group,
  Heading,
  HStack,
  Input,
  Stack,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react'

import { Radio, RadioGroup } from '@/components/ui/radio'
/*import {
  RadioCardItem,
  RadioCardLabel,
  RadioCardRoot,
} from '@/components/ui/radio-card'*/

import { Field } from '@/components/ui/field'
// @TODO: Look at exporting this from package
// import { getCountries } from '@commercelayer/react-components/utils/countryStateCity'
import { AccordionContext } from '@/components/data/AccordionProvider'
import {
  CheckoutContext,
  LicenseOwner,
} from '@/commercelayer/providers/checkout'
import { StepContainer } from '@/components/ui/StepContainer'
import { StepHeader } from '@/components/ui/StepHeader'
import type { Order } from '@commercelayer/sdk'
import classNames from 'classnames'
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
    billingAddress,
    isLicenseForClient,
  } = checkoutCtx

  const projectTypes = [
    {
      value: 'yourself',
      title: 'Yourself',
      description: 'You will own the license',
    },
    {
      value: 'client',
      title: 'Your client',
      description: 'Your client will own the license',
    },
  ]

  const defaultProjectType = isLicenseForClient ? 'client' : 'yourself'
  const [projectType, setProjectType] = useState(defaultProjectType)

  useEffect(() => {
    setProjectType(isLicenseForClient ? 'client' : 'yourself')
  }, [isLicenseForClient])

  const s = async (values, err, e) => {
    setIsLocalLoader(true)
    // @TODO: How to declare type "LicenseOwner" here
    const owner =
      projectType === 'client'
        ? Object.assign(
            { is_client: projectType === 'client' },
            ...Object.keys(values).map((key) => ({ [key]: values[key].value }))
          ) // if `projectType === 'yourself'` grab the billing address details
        : {
            is_client: false,
            company: billingAddress.company,
            full_name: billingAddress.full_name,
            line_1: billingAddress.line_1,
            line_2: billingAddress.line_2,
            city: billingAddress.city,
            zip_code: billingAddress.zip_code,
            state_code: billingAddress.state_code,
            country_code: billingAddress.country_code,
          }

    console.log('Submit license: ', { owner })

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
      console.log('Submit license: ', { updatedOrder })

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
      <>
        {accordionCtx.isActive && (
          <VStack gap={'4'}>
            <RadioGroup
              value={projectType}
              onValueChange={(e) => setProjectType(e.value)}
            >
              <HStack gap="6">
                {projectTypes.map((type) => (
                  <Radio key={type.value} value={type.value}>
                    {type.title}
                  </Radio>
                ))}
              </HStack>
            </RadioGroup>
            {/*
            // @NOTE: cool, but no clear path for usuage as a controlled component in the docs
            <RadioCardRoot defaultValue={defaultProjectType} gap="4" maxW="sm">
              <RadioCardLabel>
                The typeface is being used in a project for
              </RadioCardLabel>
              <Group attached orientation="horizontal">
                {projectTypes.map((type) => (
                  <RadioCardItem
                    onChange={(e) =>
                      e.target.value && setProjectType(e.target.value)
                    }
                    width="full"
                    indicatorPlacement="start"
                    label={type.title}
                    description={type.description}
                    key={type.value}
                    value={type.value}
                  />
                ))}
              </Group>
            </RadioCardRoot>*/}
            <form
              ref={submitValidation}
              autoComplete="off"
              onSubmit={handleSubmit(s)}
            >
              <Fieldset.Root size="lg" minW="sm">
                <Fieldset.Content>
                  {projectType === 'client' ? (
                    <>
                      <Field label={'License Owner/Company*'}>
                        <Input
                          name={'company'}
                          type={'text'}
                          ref={validation}
                          borderRadius={0}
                          colorPalette={'gray'}
                          variant={'subtle'}
                          size={'lg'}
                          defaultValue={
                            order?.metadata?.license?.owner?.company
                          }
                        />
                      </Field>

                      <Field label={'Name'}>
                        <Input
                          name={'full_name'}
                          type={'text'}
                          ref={validation}
                          borderRadius={0}
                          colorPalette={'gray'}
                          variant={'subtle'}
                          size={'lg'}
                          defaultValue={
                            order?.metadata?.license?.owner?.full_name
                          }
                        />
                      </Field>
                      <Field label={'Address'}>
                        <Input
                          name={'line_1'}
                          type={'text'}
                          ref={validation}
                          borderRadius={0}
                          colorPalette={'gray'}
                          variant={'subtle'}
                          size={'lg'}
                          defaultValue={order?.metadata?.license?.owner?.line_1}
                        />
                      </Field>
                      <Field label={'Apartment, suite, etc.'}>
                        <Input
                          name={'line_2'}
                          type={'text'}
                          ref={validation}
                          borderRadius={0}
                          colorPalette={'gray'}
                          variant={'subtle'}
                          size={'lg'}
                          defaultValue={order?.metadata?.license?.owner?.line_2}
                        />
                      </Field>
                      <Field label={'City*'}>
                        <Input
                          name={'city'}
                          type={'text'}
                          ref={validation}
                          borderRadius={0}
                          colorPalette={'gray'}
                          variant={'subtle'}
                          size={'lg'}
                          defaultValue={order?.metadata?.license?.owner?.city}
                        />
                      </Field>
                      <Field label={'Zip Code*'}>
                        <Input
                          name={'zip_code'}
                          type={'text'}
                          ref={validation}
                          borderRadius={0}
                          colorPalette={'gray'}
                          variant={'subtle'}
                          size={'lg'}
                          defaultValue={
                            order?.metadata?.license?.owner?.zip_code
                          }
                        />
                      </Field>
                      <Field label={'Country'}>
                        <Input
                          name={'country_code'}
                          type={'text'}
                          ref={validation}
                          borderRadius={0}
                          colorPalette={'gray'}
                          variant={'subtle'}
                          size={'lg'}
                          defaultValue={
                            order?.metadata?.license?.owner?.country_code
                          }
                        />
                      </Field>
                    </>
                  ) : (
                    <></>
                  )}
                  <Button type={'submit'}>Save & proceed</Button>
                </Fieldset.Content>
              </Fieldset.Root>
            </form>
          </VStack>
        )}
      </>
    </StepContainer>
  )
}
