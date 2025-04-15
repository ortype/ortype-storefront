'use client'

import getVideoId from '@/sanity/utils/get-video-id'
import { toPlainText } from '@portabletext/toolkit'
import { PortableTextBlock } from '@portabletext/types'
import { PlayIcon } from '@sanity/icons'
import React, { useEffect, useState } from 'react'
import { defineField, defineType } from 'sanity'

interface ImageProps {
  url: string
}

const extractVideoId = (url: string): string | null => {
  try {
    return getVideoId(url)?.id || null
  } catch (error) {
    console.warn('Failed to extract video ID:', error)
    return null
  }
}

const Image: React.FC<ImageProps> = ({ url }) => {
  const [videoId, setVideoId] = useState<string | null>(null)
  useEffect(() => {
    if (url) {
      setVideoId(extractVideoId(url))
    }
  }, [url])
  if (!url) return null

  let src
  if (url.match(/youtube\.com/)) {
    src = `http://img.youtube.com/vi/${videoId}/0.jpg`
  } else if (url.match(/vimeo\.com/)) {
    src = `https://vumbnail.com/${videoId}.jpg`
  }
  return src ? <img src={src} alt="" /> : <div>Video preview not available</div>
}

export default defineType({
  name: 'module.video',
  type: 'object',
  title: 'Video',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      title: 'YouTube or Vimeo video URL',
      validation: (Rule) => Rule.required(),
    }),
    /*
    {
      name: 'isBackground',
      type: 'boolean',
      title: 'Background video (autoplay)',
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'array',
      of: [
        {
          lists: [],
          marks: { decorators: [] },
          styles: [],
          type: 'block',
        },
      ],
      hidden: ({ parent }) => parent.isBackground,
    },*/
  ],
  preview: {
    select: {
      url: 'url',
      // caption: 'caption',
    },
    prepare: ({
      url,
    }: // caption,
    {
      url?: string
      // caption?: PortableTextBlock[]
    }) => {
      // const captionText = caption ? toPlainText(caption) : ''

      return {
        title: `Video (${url})`,
        // subtitle: captionText,
        media: typeof window === 'undefined' ? null : <Image url={url || ''} />,
      }
    },
  },
})
