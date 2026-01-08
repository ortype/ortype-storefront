import { useEffect, useState } from 'react'
import { useDocumentOperation } from 'sanity'

interface VideoModule {
  _type: string
  _key: string
  url?: string
  aspectRatio?: number
  poster?: string
  isBackground?: boolean
}

// Helper function to recursively find all module.video items in a document
function findVideoModules(obj: any, videos: VideoModule[] = [], path: string = ''): VideoModule[] {
  if (!obj || typeof obj !== 'object') {
    return videos
  }

  // Check if current object is a video module FIRST before recursing
  if (obj._type === 'module.video' && obj.url) {
    // Generate a _key if one doesn't exist (for direct fields like headerVideo)
    const key = obj._key || `${path}_video`
    videos.push({
      _type: obj._type,
      _key: key,
      url: obj.url,
      aspectRatio: obj.aspectRatio,
      poster: obj.poster,
      isBackground: obj.isBackground,
    })
    // Don't recurse into video module properties
    return videos
  }

  // Recursively search through arrays and objects
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => findVideoModules(item, videos, `${path}[${index}]`))
  } else {
    Object.entries(obj).forEach(([key, value]) => {
      findVideoModules(value, videos, path ? `${path}.${key}` : key)
    })
  }

  return videos
}

// Helper function to update video modules in document with metadata
function updateVideoModules(
  obj: any,
  videoMap: Map<string, { aspectRatio?: number; poster?: string }>
): any {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  // Update if this is a video module with a matching _key
  if (obj._type === 'module.video' && obj._key && videoMap.has(obj._key)) {
    const metadata = videoMap.get(obj._key)!
    return {
      ...obj,
      aspectRatio: metadata.aspectRatio,
      poster: metadata.poster,
    }
  }

  // Recursively update arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => updateVideoModules(item, videoMap))
  }

  // Recursively update objects
  const updated: any = {}
  Object.entries(obj).forEach(([key, value]) => {
    updated[key] = updateVideoModules(value, videoMap)
  })
  return updated
}

export function VimeoMetadataAction(props: any) {
  const { patch, publish } = useDocumentOperation(props.id, props.type)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    // Reset publishing state when draft becomes null (published)
    if (isPublishing && !props.draft) {
      setIsPublishing(false)
    }
  }, [isPublishing, props.draft])

  return {
    disabled: publish.disabled,
    label: isPublishing ? 'Publishing…' : 'Publish',
    onHandle: async () => {
      setIsPublishing(true)

      // Find all video modules in the document
      const videoModules = findVideoModules(props.draft)

      // Filter for Vimeo videos that don't have aspect ratio
      const vimeoVideosToFetch = videoModules.filter((video) => {
        const isVimeo = video.url?.includes('vimeo.com')
        const needsAspectRatio = !video.aspectRatio
        return isVimeo && needsAspectRatio
      })

      if (vimeoVideosToFetch.length > 0) {
        try {
          // Call the Vimeo API route
          const response = await fetch('/api/vimeo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: vimeoVideosToFetch }),
          })

          if (response.ok) {
            const { results } = await response.json()

            // Create a map of _key to video metadata
            const videoMap = new Map<string, { aspectRatio?: number }>()
            results.forEach((result: any) => {
              if (result.aspectRatio) {
                videoMap.set(result._key, {
                  aspectRatio: result.aspectRatio,
                })
              }
            })

            // Update the document with new aspect ratios
            if (videoMap.size > 0) {
              // Recursively update all fields that might contain videos
              const updates: any = {}

              if (props.draft.modules) {
                updates.modules = updateVideoModules(
                  props.draft.modules,
                  videoMap,
                )
              }

              if (props.draft.hero) {
                updates.hero = updateVideoModules(props.draft.hero, videoMap)
              }

              if (props.draft.body) {
                updates.body = updateVideoModules(props.draft.body, videoMap)
              }

              if (props.draft.header) {
                updates.header = updateVideoModules(props.draft.header, videoMap)
              }

              // Handle direct video fields like headerVideo
              if (props.draft.headerVideo && props.draft.headerVideo._type === 'module.video') {
                const headerVideoKey = 'headerVideo_video'
                if (videoMap.has(headerVideoKey)) {
                  const metadata = videoMap.get(headerVideoKey)!
                  updates.headerVideo = {
                    ...props.draft.headerVideo,
                    aspectRatio: metadata.aspectRatio,
                  }
                }
              }

              // Apply the patch
              patch.execute([{ set: updates }])
            }
          } else {
            console.error('Failed to fetch Vimeo metadata')
          }
        } catch (error) {
          console.error('Error fetching Vimeo metadata:', error)
        }
      }

      // Perform the publish
      publish.execute()

      // Signal that the action is completed
      props.onComplete()
    },
  }
}
