import { List, X } from "phosphor-react"
import { useContext } from "react"

import { Button } from "./styled"

import { SettingsContext } from "components/data/SettingsProvider"

function MenuButton(): JSX.Element {
  const ctx = useContext(SettingsContext)

  const handlerOnClick = () => ctx?.toggleMobileMenu()

  return (
    <Button onClick={handlerOnClick}>
      {ctx?.showMobileMenu ? (
        <X weight="regular" className="w-5" />
      ) : (
        <List weight="regular" className="w-5" />
      )}
    </Button>
  )
}

export default MenuButton
