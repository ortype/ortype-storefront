import CommerceLayer from '@commercelayer/sdk'
import { Buy } from 'components/composite/Buy'
import { CustomerContext } from 'components/data/CustomerProvider'
import FontPage from 'components/FontPage'
import dynamic from 'next/dynamic'
import React, { useContext } from 'react'

const DynamicBuyContainer: any = dynamic(
  () => import('components/composite/BuyContainer'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)
const DynamicBuy: any = dynamic(() => import('components/composite/Buy'), {
  loading: function LoadingSkeleton() {
    return <div />
  },
})

const FontWrapper = ({ preview, loading, moreFonts, font, siteSettings }) => {
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
      <DynamicBuyContainer font={font}>
        <DynamicBuy />
      </DynamicBuyContainer>
      {/*<FontPage
        // loading
        // preview
        cl={cl}
        font={font}
        moreFonts={moreFonts}
        siteSettings={siteSettings}
        endpoint={customerContext?.endpoint}
        accessToken={customerContext?.accessToken}
      />*/}
    </>
  )
}

export default FontWrapper
