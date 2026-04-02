// components/ArrayMemberPreview.js
import { Badge, Box, Flex, Stack, Text } from '@sanity/ui'
import React, { useEffect, useState } from 'react'

const ArrayMemberPreview = (props) => {
  // @NOTE: we cannot access a _key or index here
  const { modifier, path } = props
  const [index, setIndex] = useState(null)

  useEffect(() => {
    const segments = path?.split('.')
    const lastSegment = segments && segments[segments.length - 1]

    if (!isNaN(lastSegment)) {
      setIndex(parseInt(lastSegment, 10))
    }
  }, [path])

  return (
    <Box
      padding={1}
      // style={{ borderLeftColor: '#2196F3' }}
    >
      <Flex gap={3} align="center">
        {index !== null && (
          <Badge tone="primary" padding={2}>
            #{index}
          </Badge>
        )}
        <Stack space={1} flex={1}>
          {modifier && <Text size={1}>{`${modifier}%`}</Text>}
        </Stack>
      </Flex>
    </Box>
  )
}

export default ArrayMemberPreview
