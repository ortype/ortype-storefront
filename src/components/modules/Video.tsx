import getVideoId from '@/sanity/utils/get-video-id'
import { AspectRatio, Box, Presence, Text } from '@chakra-ui/react'
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponents,
} from '@portabletext/react'
import { useInView } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import VimeoPlayerNative from './vimeo-player-native'

interface VideoValue {
  url?: string
  caption?: PortableTextBlock[]
  isBackground?: boolean
  aspectRatio?: number
  videoUrl?: string
  poster?: string
}

interface VideoProps {
  value?: VideoValue
  style: any
}

const extractVideoId = (url: string): string | null => {
  try {
    return getVideoId(url)?.id || null
  } catch (error) {
    console.warn('Failed to extract video ID:', error)
    return null
  }
}

const Video: React.FC<VideoProps> = ({ value = {}, style }) => {
  const {
    url,
    caption,
    isBackground = true,
    aspectRatio,
    videoUrl,
    poster,
  } = value as VideoValue

  const [videoId, setVideoId] = useState<string | null>(null)
  const [service, setService] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef)

  useEffect(() => {
    if (url) {
      const videoData = getVideoId(url)
      setVideoId(videoData?.id || null)
      setService(videoData?.service || null)
    }
  }, [url])

  if (!url || !videoId) return null

  // Calculate aspect ratio with fallback to 16:9
  const ratio = aspectRatio || 16 / 9

  // Use native player for Vimeo background videos
  const useNativePlayer = isBackground && service === 'vimeo'

  let src: string | undefined
  const config: Record<string, any> = {}

  if (service === 'youtube') {
    src = `https://www.youtube.com/embed/${videoId}`
  } else if (service === 'vimeo') {
    src = `https://player.vimeo.com/video/${videoId}`
    config.vimeo = {
      playerOptions: {
        background: isBackground,
        color: '#CFC3B3',
        portrait: false,
        vimeo_logo: false,
        responsive: true,
        cc: false,
        transcript: false,
        fullscreen: false,
        pip: false,
      },
    }
  }

  return (
    <>
      <AspectRatio 
        ratio={ratio} 
        ref={containerRef}
        maxHeight="100%"
        width="auto"
        maxWidth="100%"
        mx="auto"
      >
        {useNativePlayer ? (
          <VimeoPlayerNative
            videoId={videoId}
            videoUrl={videoUrl}
            poster={poster}
            autoplay={isInView}
            loop={isBackground}
            muted={isBackground}
            controls={false}
            isBackground={isBackground}
          />
        ) : (
          <Presence
            present={true}
            animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
            animationDuration="moderate"
          >
            <ReactPlayer
              url={src}
              volume={isBackground ? 0 : 1}
              muted={isBackground}
              playsinline
              controls={!isBackground}
              playing={isBackground && isInView}
              loop={isBackground}
              config={config}
              width="100%"
              height="100%"
              style={style}
            />
          </Presence>
        )}
      </AspectRatio>
      {caption && (
        <Box mt={4}>
          <PortableText
            value={caption}
            components={
              {
                block: {
                  normal: ({ children }: { children: React.ReactNode }) => (
                    <Text>{children}</Text>
                  ),
                },
              } as PortableTextComponents
            }
          />
        </Box>
      )}
    </>
  )
}

export default Video
