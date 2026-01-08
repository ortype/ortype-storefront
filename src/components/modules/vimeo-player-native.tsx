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
  const [isPlaying, setIsPlaying] = useState(false)

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

  // Listen for Vimeo player events using postMessage API
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Vimeo
      if (!event.origin.includes('vimeo.com')) return

      try {
        const data = JSON.parse(event.data)
        
        // When player is ready, register event listeners
        if (data.event === 'ready' && iframeRef.current?.contentWindow) {
          const player = iframeRef.current.contentWindow
          player.postMessage(JSON.stringify({ method: 'addEventListener', value: 'play' }), '*')
          player.postMessage(JSON.stringify({ method: 'addEventListener', value: 'timeupdate' }), '*')
        }
        
        // Listen for play or timeupdate events
        if (data.event === 'play' || data.event === 'timeupdate') {
          setIsPlaying(true)
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

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
          opacity: isPlaying ? 1 : 0,
          transition: 'opacity 0.6s ease-in',
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
