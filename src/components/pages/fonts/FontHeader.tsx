import Video from '@/components/modules/Video'
import {
  AbsoluteCenter,
  AspectRatio,
  Box,
  Center,
  Flex,
  Heading,
} from '@chakra-ui/react'
import { useDimensions } from './contexts/dimensionsContext'

export interface FontHeaderProps {
  video: any
  title: string
  variantId: string
}

export default function FontHeader({
  title,
  variantId,
  video,
}: FontHeaderProps) {
  const { spreadAspectValue, isLoading, marginBottom, conversion } =
    useDimensions()
  return (
    <Box
      className={'header-spread'}
      flex={'0 0 100%'} // responsive values
      mb={marginBottom}
      position="relative"
      // the before creates the height
      height={`${spreadAspectValue}vh`}
      overflow={'hidden'}
    >
      <AbsoluteCenter zIndex={1}>
        <Heading
          transition="opacity 0.3s ease-in-out"
          opacity={isLoading ? 0 : 1}
          className={variantId}
          pt={'0.5rem'}
          pb={'0.25rem'}
          textAlign={'center'}
          fontSize={`${220 * conversion}px`}
          lineHeight={`${220 * conversion}px`}
          h={'100%'}
          color={'white'}
          fontWeight={'normal'}
        >
          {title}
        </Heading>
      </AbsoluteCenter>
      <Box
        css={{
          '& > div > div > div': { position: 'inherit !important' },
        }}
      >
        <Video
          value={video}
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </Box>
    </Box>
  )
}
