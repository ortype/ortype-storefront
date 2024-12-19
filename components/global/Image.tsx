import { client } from '@/lib/sanity.client'
import { useNextSanityImage } from 'next-sanity-image'
import Image from 'next/image'

interface ImageSanityNextProps {
  image: any
  sizes?: string
  priority?: boolean
  style?: any
}

export default function ImageSanityNext(props: ImageSanityNextProps) {
  const { image: asset, sizes, priority, style } = props

  const imageProps = useNextSanityImage(client, asset)

  if (!imageProps) return null

  return (
    <Image
      data-sanity={props['data-sanity']}
      {...imageProps}
      alt={'hi'}
      style={style || { width: '100%', height: 'auto' }} // "responsive"
      sizes={sizes || '(max-width: 800px) 100vw, 800px'}
    />
  )
}
