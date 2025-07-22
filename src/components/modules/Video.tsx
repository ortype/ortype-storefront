import getVideoId from '@/sanity/utils/get-video-id'
import { Box, Presence, Text } from '@chakra-ui/react'
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponents,
} from '@portabletext/react'
import React, { useEffect, useState } from 'react'
import { ReactPlayerProps } from 'react-player/types'
import VimeoPlayer from 'react-player/vimeo'

interface VideoValue {
  url?: string
  caption?: PortableTextBlock[]
  isBackground?: boolean
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
  const { url, caption, isBackground = true } = value as VideoValue

  const [loading, setLoading] = useState<boolean>(true)
  const [playerReady, setPlayerReady] = useState<boolean>(false)

  const [videoId, setVideoId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    if (url) {
      setVideoId(extractVideoId(url))
    }
  }, [url])

  if (!url || !videoId) return null

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
      preload: true,
      iframeParams: {
        allow: 'autoplay',
      },
    }
  }

  const handlePlayerReady = () => {
    setLoading(false)
    setPlayerReady(true)
  }

  return (
    <VimeoPlayer
      url={src}
      volume={1}
      onReady={() => {
        setLoading(false)
        setPlayerReady(true)
      }}
      loop={true}
      muted={true}
      controls={false}
      playing={playerReady}
      config={config}
      width="100%"
      height="100%"
      style={style}
    />
  )
}

export default Video
