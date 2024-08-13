'use client'
import CommerceLayer from '@commercelayer/sdk'
import { Buy } from 'components/composite/Buy'
import { CustomerContext } from 'components/data/CustomerProvider'
import dynamic from 'next/dynamic'
import React, { useContext } from 'react'
import FontContainer from './FontContainer'
import Modules from '@/components/modules'

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

const FontWrapper = ({ moreFonts, font }) => {
  /*
  const customerContext = useContext(CustomerContext)

  let cl
  if (customerContext?.accessToken) {
    cl = CommerceLayer({
      organization: process.env.NEXT_PUBLIC_CL_SLUG || '',
      accessToken: customerContext?.accessToken,
    })
  }
*/

  return (
    <>
      <FontContainer font={font} moreFonts={moreFonts}>
        {font?.modules && <Modules value={font.modules} />}
      </FontContainer>
      {/*<DynamicBuyContainer font={font}>
        <DynamicBuy />
      </DynamicBuyContainer>*/}
    </>
  )
}

export default FontWrapper
