import React, { useEffect, useRef, useState } from 'react'

interface VimeoPlayerNativeProps {
  videoId: string
  videoUrl?: string
  poster?: string
  width: number
  height: number
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
  width,
  height,
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  isBackground = false,
  onLoadedMetadata,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Intersection Observer for autoplay on scroll
  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting)
        })
      },
      {
        threshold: 0.5, // Trigger when 50% visible
        rootMargin: '0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

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
  }, [loop, autoplay, muted, controls, isBackground, videoId])

  // Control video playback via postMessage API
  useEffect(() => {
    if (!isLoaded || !iframeRef.current) return

    const iframe = iframeRef.current
    const player = iframe.contentWindow

    // Small delay to ensure Vimeo player is fully initialized
    const timer = setTimeout(() => {
      if (isIntersecting) {
        // Play video when in view - use proper Vimeo Player API format
        player?.postMessage(JSON.stringify({ method: 'play' }), '*')
      } else {
        // Pause video when out of view
        player?.postMessage(JSON.stringify({ method: 'pause' }), '*')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isIntersecting, isLoaded])

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
          player.postMessage(
            JSON.stringify({ method: 'addEventListener', value: 'play' }),
            '*'
          )
          player.postMessage(
            JSON.stringify({ method: 'addEventListener', value: 'timeupdate' }),
            '*'
          )
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

  const handleIframeLoad = () => {
    setIsLoaded(true)
    // Immediately pause on load, wait for intersection observer
    if (iframeRef.current) {
      const player = iframeRef.current.contentWindow
      setTimeout(() => {
        player?.postMessage(JSON.stringify({ method: 'pause' }), '*')
      }, 100)
    }
  }

  // Delay hiding the poster so the video has time to render a frame
  const [showPoster, setShowPoster] = useState(true)
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => setShowPoster(false), 600)
      return () => clearTimeout(timer)
    }
  }, [isPlaying])

  // Fall back to iframe if no direct video URL is available
  if (!videoUrl) {
    return (
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          overflow: 'hidden',
          margin: '0 auto',
        }}
      >
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          onLoad={handleIframeLoad}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
            opacity: isPlaying ? 1 : 0,
            transition: 'opacity 0.1s ease-in',
          }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={`Vimeo video ${videoId}`}
        />
        {poster && (
          <img
            src={poster}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showPoster ? 1 : 0,
              transition: 'opacity 0.5s ease',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
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
