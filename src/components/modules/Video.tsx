import { AspectRatio, Box, Presence, Text } from '@chakra-ui/react'
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponents,
} from '@portabletext/react'
import { useInView } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
// import YoutubePlayer from 'react-player/youtube'
// import VimeoPlayer from 'react-player/vimeo'
import getVideoId from '@/sanity/utils/get-video-id'
import ReactPlayer from 'react-player'
import { ReactPlayerProps } from 'react-player/types'

interface VideoValue {
  url?: string
  caption?: PortableTextBlock[]
  isBackground?: boolean
}

interface VideoProps {
  value?: VideoValue
}

const extractVideoId = (url: string): string | null => {
  try {
    return getVideoId(url)?.id || null
  } catch (error) {
    console.warn('Failed to extract video ID:', error)
    return null
  }
}

const Video: React.FC<VideoProps> = ({ value = {} }) => {
  const { url, caption, isBackground = true } = value as VideoValue

  const [videoId, setVideoId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef)
  useEffect(() => {
    if (url) {
      setVideoId(extractVideoId(url))
    }
  }, [url])

  if (!url) return null

  let src: string | undefined
  const config: Record<string, any> = {}
  // let ReactPlayer
  if (url?.match(/youtube\.com/)) {
    src = `https://www.youtube.com/embed/${videoId}`
    // ReactPlayer = YoutubePlayer
  } else if (url?.match(/vimeo\.com/)) {
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
    // ReactPlayer = VimeoPlayer
  }

  return (
    <>
      <AspectRatio ratio={6 / 10} ref={containerRef}>
        <Presence
          lazyMount
          present={isInView}
          animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
          animationDuration="moderate"
        >
          <ReactPlayer
            url={src}
            volume={1}
            muted={isBackground}
            controls={isBackground ? false : true}
            playing={isBackground && isInView}
            config={config}
            width="100%"
            height="100%"
          />
        </Presence>
      </AspectRatio>
    </>
  )
}

export default Video
