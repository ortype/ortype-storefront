import { useOrderContext } from '@/commercelayer/providers/Order'
import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react'
import { useRapidForm } from 'rapid-form'
import { useState } from 'react'

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
      <FormControl>
        <FormLabel>{'License Owner/Company*'}</FormLabel>
        <Input
          name={'full_name'}
          type={'text'}
          ref={validation}
          size={'lg'}
          defaultValue={order?.metadata?.license?.owner?.full_name}
        />
      </FormControl>
      <Button type={'submit'}>Save</Button>
    </form>
  )
}

export default LicenseOwnerInput
