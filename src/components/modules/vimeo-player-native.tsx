import React, { useEffect, useRef, useState } from 'react'

interface VimeoPlayerNativeProps {
  videoId: string
  videoUrl?: string
  poster?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  isBackground?: boolean
  onLoadedMetadata?: () => void
}

const VimeoPlayerNative: React.FC<VimeoPlayerNativeProps> = ({
  videoId,
  videoUrl,
  poster,
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  isBackground = false,
  onLoadedMetadata,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // Build iframe URL - background mode handles autoplay automatically
  const iframeSrc = React.useMemo(() => {
    const params = new URLSearchParams(
      isBackground
        ? {
            background: '1',
            muted: '1',
            autopause: '0',
          }
        : {
            autoplay: autoplay ? '1' : '0',
            loop: loop ? '1' : '0',
            muted: muted ? '1' : '0',
            controls: controls ? '1' : '0',
            color: 'CFC3B3',
            portrait: '0',
            byline: '0',
            title: '0',
          }
    )
    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`
  }, [loop, muted, controls, isBackground, videoId])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Attempt autoplay when the component mounts if autoplay is enabled
    if (autoplay) {
      video.play().catch((error) => {
        console.warn('Autoplay prevented:', error)
      })
    }
  }, [autoplay, videoUrl])

  // Fall back to iframe if no direct video URL is available
  if (!videoUrl) {
    return (
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 0,
        }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={`Vimeo video ${videoId}`}
      />
    )
  }

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      poster={poster}
      loop={loop}
      muted={muted}
      playsInline
      controls={controls}
      preload="metadata"
      onLoadedMetadata={onLoadedMetadata}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  )
}

export default VimeoPlayerNative
