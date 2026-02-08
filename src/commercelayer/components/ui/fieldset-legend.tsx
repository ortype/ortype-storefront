import { InfoTip } from '@/components/ui/toggle-tip'
import { Fieldset, Flex } from '@chakra-ui/react'
import React from 'react'

interface Props {
  info?: string
  children: React.ReactNode
}

export const FieldsetLegend: React.FC<Props> = ({ children, info }) => {
  return (
    <Fieldset.Legend
      px={3}
      fontSize={'xs'}
      textTransform={'uppercase'}
      fontVariantNumeric={'tabular-nums'}
      color={'#737373'}
      asChild
    >
      <Flex gap={1} alignItems={'center'}>
        {children}
        {info && (
          <InfoTip
            content={
              info || 'This is additional information about this fieldset'
            }
          />
        )}
      </Flex>
    </Fieldset.Legend>
  )
}
