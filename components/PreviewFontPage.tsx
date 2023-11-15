import type { Font } from 'lib/sanity.queries'
import Link from 'next/link'

export default function PreviewFontPage({ name, slug }: Omit<Font, '_id'>) {
  return (
    <div>
      <h3 className="mb-3 text-3xl leading-snug">
        <Link href={`/font/${slug}`} className="hover:underline">
          {name}
        </Link>
      </h3>
    </div>
  )
}
