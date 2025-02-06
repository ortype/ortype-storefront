'use client'
import Empty from '@/components/composite/Account/Empty'
import { AddButton } from '@/components/ui/Account/AddButton'
import CustomerAddressCard from '@/components/ui/Account/CustomerAddressCard'
import { Grid, Heading } from '@chakra-ui/react'
import { AddressesContainer } from '@commercelayer/react-components/addresses/AddressesContainer'
import { AddressesEmpty } from '@commercelayer/react-components/addresses/AddressesEmpty'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

function AddressesPage(): JSX.Element {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <AddressesContainer>
      <Heading>{t('addresses.title')}</Heading>
      <AddressesEmpty>{() => <Empty type="Addresses" />}</AddressesEmpty>
      <Grid data-test-id="addresses-wrapper">
        <CustomerAddressCard />
      </Grid>
      <AddButton
        action={() => {
          router.push(`/account/addresses/new`)
        }}
        testId="show-new-address"
      />
    </AddressesContainer>
  )
}

export default AddressesPage
