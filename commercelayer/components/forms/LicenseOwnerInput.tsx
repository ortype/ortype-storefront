import { useOrderContext } from '@/commercelayer/providers/Order'
import { Field } from '@/components/ui/field'
import { Box, Button, Fieldset, Input } from '@chakra-ui/react'
import { useRapidForm } from 'rapid-form'
import { useState } from 'react'

const LicenseOwnerInput = () => {
  const [isLocalLoader, setIsLocalLoader] = useState(false)
  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm()
  const { order, orderId, setLicenseOwner, updateOrder } = useOrderContext()

  const s = async (values, err, e) => {
    setIsLocalLoader(true)
    const licenseOwner = {
      is_client: false,
      full_name: values['full_name'].value,
    }
    setLicenseOwner({ licenseOwner })
    setIsLocalLoader(false)
  }

  // @TODO: convert to react-hook-form
  // https://www.chakra-ui.com/docs/components/input#hook-form
  // @TODO: save input changes on blur

  return (
    <form
      as={Box}
      ref={submitValidation}
      autoComplete="off"
      onSubmit={handleSubmit(s)}
    >
      <Fieldset.Root>
        <Field label={'License Owner/Company*'}>
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
      </Fieldset.Root>
      <Button type={'submit'}>Save</Button>
    </form>
  )
}

export default LicenseOwnerInput
