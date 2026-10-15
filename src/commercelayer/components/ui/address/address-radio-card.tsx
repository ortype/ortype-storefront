import { RadioCardItem } from '@/components/ui/radio-card'
import { Box, Button } from '@chakra-ui/react'
import type { Address } from '@commercelayer/sdk'
import { AddressCard } from './address-card'

interface Props {
  address: Address
  selected: boolean
  disabled?: boolean
  onEdit: () => void
}

export const AddressRadioCard = ({
  address,
  selected,
  disabled,
  onEdit,
}: Props) => (
  <Box pos={'relative'} w={'full'}>
    <RadioCardItem
      value={address.id}
      isSelected={selected}
      disabled={disabled}
      indicatorPlacement='start'
      label={<AddressCard address={address} bg='transparent' p={0} />}
      w={'full'}
      h={'full'}
      addon={
        selected ? (
          <Button
            type='button'
            variant='text'
            size='sm'
            disabled={disabled}
            onClick={onEdit}
          >
            {'Edit address'}
          </Button>
        ) : (
          <></>
        )
      }
    />
  </Box>
)
