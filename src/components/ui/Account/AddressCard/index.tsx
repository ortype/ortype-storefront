import { SettingsContext } from '@/components/data/SettingsProvider'
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Box, Button, Card, Flex, Text, Wrap } from '@chakra-ui/react'
import AddressField from '@commercelayer/react-components/addresses/AddressField'
import type { Address as CLayerAddress } from '@commercelayer/sdk'
import { useRouter } from 'next/navigation'
import { Trash, X } from 'phosphor-react'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
interface Props {
  address?: CLayerAddress
  addressType: string
  readonly?: boolean
  editButton?: string
  deleteButton?: string
}

export function AddressCard({
  address,
  addressType,
  readonly,
  editButton,
  deleteButton,
}: Props): JSX.Element {
  const { t } = useTranslation()

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const router = useRouter()
  const appCtx = useContext(SettingsContext)

  if (!address) return <></>
  const {
    first_name,
    last_name,
    line_1,
    line_2,
    zip_code,
    city,
    state_code,
    country_code,
    phone,
  } = address

  return (
    <Box>
      <Card.Root>
        <Card.Body>
          <Text data-cy={`fullname_${addressType}`}>
            {first_name} {last_name}
          </Text>
          <Text data-cy={`full_address_${addressType}`}>
            {line_2 != null ? [line_1, line_2].join(', ') : line_1}
            <br />
            {zip_code} {city} ({state_code}) - {country_code}
            <br />
            {phone}
            <br />
          </Text>
        </Card.Body>
        {readonly === undefined && (
          <Card.Footer>
            <Flex direction={'column'} justify={'end'} pt={2}>
              <Wrap>
                <AddressField
                  type="edit"
                  label={editButton || t('addresses.edit')}
                  className="address-edit-button"
                  onClick={(address) => {
                    router.push(`/account/addresses/${address?.id}/edit`)
                  }}
                />
                <DialogRoot
                  lazyMount
                  open={showDeleteConfirmation}
                  onOpenChange={(e) => setShowDeleteConfirmation(e.open)}
                >
                  <DialogTrigger asChild>
                    <Button variant={'plain'} className="address-delete-button">
                      <Trash className="w-3.5 h-3.5" />
                      <Text as={'span'}>
                        {deleteButton || t('addresses.delete')}
                      </Text>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {t('addresses.deleteConfirmation')}
                      </DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                      <DialogActionTrigger asChild>
                        <Button
                          className="address-confirm-delete-button"
                          onClick={() => {
                            setShowDeleteConfirmation(false)
                          }}
                        >
                          {t('addresses.yes') as string}
                        </Button>
                      </DialogActionTrigger>
                    </DialogBody>
                  </DialogContent>
                </DialogRoot>
              </Wrap>
            </Flex>
          </Card.Footer>
        )}
      </Card.Root>
    </Box>
  )
}
