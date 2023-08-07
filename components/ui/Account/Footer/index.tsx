import { useTranslation } from "react-i18next"

import { ListItem, ListLink, ListWrapper, LogoWrapper, Wrapper } from "./styled"

interface Props {
  termsUrl?: string
  privacyUrl?: string
}

function Footer({ termsUrl, privacyUrl }: Props): JSX.Element {
  const { t } = useTranslation()

  return (
    <div>
      {(termsUrl || privacyUrl) && (
        <ListWrapper>
          <ListLink>
            {termsUrl && (
              <ListItem>
                <a target="_blank" href={termsUrl} rel="noreferrer">
                  {t("general.terms_link")}
                </a>
              </ListItem>
            )}
            {privacyUrl && (
              <ListItem>
                <a target="_blank" href={privacyUrl} rel="noreferrer">
                  {t("general.privacy_link")}
                </a>
              </ListItem>
            )}
          </ListLink>
        </ListWrapper>
      )}
    </div>
  )
}

export default Footer
