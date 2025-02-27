import { client } from '@/sanity/lib/client'
import { SanityImageObject } from '@sanity/image-url/lib/types/types'
import { useNextSanityImage } from 'next-sanity-image'
import Image from 'next/image'
import { useCallback } from 'react'

interface ImageSanityNextProps {
  image: SanityImageObject & { blurDataUrl?: string; alt?: string }
  sizes?: string
  priority?: boolean
  style?: any
  alt?: string
  square?: boolean
}

export default function ImageSanityNext(props: ImageSanityNextProps) {
  const { image, sizes, square = false, priority = false, style } = props

  const customImageBuilder = useCallback(
    (imageUrlBuilder, options) => {
      if (square) {
        return imageUrlBuilder.width(900).height(900).fit('clip')
      }
      return imageUrlBuilder
    },
    [square]
  )

  const imageProps = useNextSanityImage(client, image, {
    imageBuilder: customImageBuilder,
  })

  if (!imageProps) return null

  const placeholder = image.blurDataUrl ? 'blur' : 'empty'
  const blurDataUrl = image.blurDataUrl

  return (
    <Image
      data-sanity={props['data-sanity']}
      {...imageProps}
      unoptimized={image.asset ? true : false}
      priority={priority}
      alt={props.alt || ''}
      style={style || { maxWidth: '100%', height: 'auto' }} // "responsive"
      sizes={sizes || '(max-width: 800px) 100vw, 800px'}
      placeholder={placeholder}
      blurDataURL={blurDataUrl}
    />
  )
}
