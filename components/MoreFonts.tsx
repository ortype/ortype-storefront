import FontPreview from 'components/FontPreview'
import type { font } from 'lib/sanity.queries'

export default function MoreStories({ fonts }: { fonts: font[] }) {
  return (
    <section>
      <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
        More fonts
      </h2>
      <div className="mb-32 grid grid-cols-1 gap-y-20 md:grid-cols-2 md:gap-x-16 md:gap-y-32 lg:gap-x-32">
        {fonts.map((font) => (
          <FontPreview key={font._id} name={font.name} slug={font.slug} />
        ))}
      </div>
    </section>
  )
}
