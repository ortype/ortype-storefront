'use client'
import Modules from '@/components/modules'
import { Box } from '@chakra-ui/react'
import CommerceLayer from '@commercelayer/sdk'
import { Buy } from '@/components/composite/Buy'
import { CustomerContext } from '@/components/data/CustomerProvider'
import dynamic from 'next/dynamic'
import React, { useContext } from 'react'
import FontContainer from './FontContainer'
import { SpreadContainerProvider } from './SpreadContainer'

const DynamicBuyContainer: any = dynamic(
  () => import('@/components/composite/BuyContainer'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)
const DynamicBuy: any = dynamic(() => import('@/components/composite/Buy'), {
  loading: function LoadingSkeleton() {
    return <div />
  },
})

const FontWrapper = ({ moreFonts, font }) => {
  return (
    <Box bg={'#000'}>
      <FontContainer font={font} moreFonts={moreFonts}>
        {font?.modules && (
          <SpreadContainerProvider initialItems={font.modules}>
            {(ctx) => {
              return ctx.isLoading ? (
                <div>{'Loading...'}</div>
              ) : (
                <Modules value={font.modules} />
              )
            }}
          </SpreadContainerProvider>
        )}
      </FontContainer>
      <DynamicBuyContainer font={font}>
        <DynamicBuy />
      </DynamicBuyContainer>
    </Box>
  )
}

export default FontWrapper
