import { AddressesContainer } from "@commercelayer/react-components/addresses/AddressesContainer"
import { AddressesEmpty } from "@commercelayer/react-components/addresses/AddressesEmpty"
import Empty from "components/composite/Account/Empty"
import { SettingsContext } from 'components/data/SettingsProvider'
import { AddButton } from "components/ui/Account/AddButton"
import CustomerAddressCard from "components/ui/Account/CustomerAddressCard"
import { GridContainer } from "components/ui/Account/GridContainer"
import Title from "components/ui/Account/Title"
import { useRouter } from "next/router"
import { useContext } from "react"
import { useTranslation } from "react-i18next"

function AddressesPage(): JSX.Element {
  const { t } = useTranslation()
  const router = useRouter()
  const appCtx = useContext(SettingsContext)

  return (
    <AddressesContainer>
      <Title>{t("addresses.title")}</Title>
      <AddressesEmpty>{() => <Empty type="Addresses" />}</AddressesEmpty>
      <GridContainer data-test-id="addresses-wrapper">
        <CustomerAddressCard />
      </GridContainer>
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
