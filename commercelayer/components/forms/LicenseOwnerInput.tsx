import { useOrderContext } from '@/commercelayer/providers/Order'
import { Box, Button, Fieldset, Input } from '@chakra-ui/react'
import { useRapidForm } from 'rapid-form'
import { useState } from 'react'
import { Field } from '@/components/ui/field'

const LicenseOwnerInput = () => {
  const [isLocalLoader, setIsLocalLoader] = useState(false)
  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm()
  const { order, orderId, setLicenseOwner, updateOrder } = useOrderContext()

  const s = async (values, err, e) => {
    setIsLocalLoader(true)
    const owner = { is_client: false, full_name: values['full_name'].value }
    setLicenseOwner({ licenseOwner: owner })
    setIsLocalLoader(false)
  }

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
            ref={validation}
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
