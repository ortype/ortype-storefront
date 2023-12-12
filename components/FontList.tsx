import type { Font } from 'lib/sanity.queries'
import { Tester } from './composite/Tester'

export default function FontIndex({ fonts }: { fonts: Font[] }) {
  return (
    <section>
      <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
        Fonts
      </h2>
      <div className="mb-32 grid grid-cols-1 gap-y-20 md:grid-cols-2 md:gap-x-16 md:gap-y-32 lg:gap-x-32">
        {fonts.map((font, index) =>
          font.variants[0] ? (
            <Tester
              fontId={font._id}
              variants={font.variants}
              defaultVariantId={font.variants[0]._id}
              index={index}
              title={font.name}
              slug={font.slug}
            />
          ) : (
            <></>
          )
        )}
      </div>
    </section>
  )
}
