import CommerceLayer from '@commercelayer/sdk'
import { CustomerContext } from 'components/data/CustomerProvider'
import FontPage from 'components/FontPage'
import React, { useContext } from 'react'

const TokenWrapper = ({
  preview,
  loading,
  moreFonts,
  font,
  endpoint,
  clientId,
  marketId,
  siteSettings,
}) => {
  const customerContext = useContext(CustomerContext)

  let cl
  if (customerContext?.accessToken) {
    cl = CommerceLayer({
      organization: 'or-type-mvp',
      accessToken: customerContext?.accessToken,
    })
  }

  return (
    <>
      <FontPage
        // loading
        // preview
        cl={cl}
        font={font}
        moreFonts={moreFonts}
        siteSettings={siteSettings}
        endpoint={endpoint}
        accessToken={customerContext?.accessToken}
      />
    </>
  )
}

export default TokenWrapper
