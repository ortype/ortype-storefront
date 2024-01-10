import { toPlainText } from '@portabletext/react'
import { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'
import initTranslations from '@/app/i18n'
import TranslationsProvider from '@/components/data/TranslationsProvider'

// import { Footer } from '@/components/global/Footer'
// import { Navbar } from '@/components/global/Navbar'
import { loadHomePage, loadSettings } from '@/sanity/loader/loadQuery'
import { urlForOpenGraphImage } from 'lib/sanity.utils' // from '@/sanity/lib/utils'
const i18nNamespaces = ['common']

const VisualEditing = dynamic(() => import('@/sanity/loader/VisualEditing'))

export async function generateMetadata(): Promise<Metadata> {
  const [{ data: settings }, { data: homePage }] = await Promise.all([
    loadSettings(),
    loadHomePage(),
  ])

  const ogImage = urlForOpenGraphImage(settings?.ogImage)
  return {
    title: settings?.title
      ? {
          template: `%s | ${settings.title}`,
          default: settings.title || 'Or Type',
        }
      : undefined,
    description: settings?.description
      ? toPlainText(settings.description)
      : undefined,
    // openGraph: {
    //   images: ogImage ? [ogImage] : [],
    // },
  }
}

export const viewport: Viewport = {
  themeColor: '#000',
}

export default async function LocaleRoute({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: {
    locale: string
  }
}) {
  const { t, resources } = await initTranslations(locale, i18nNamespaces)
  return (
    <>
      <TranslationsProvider
        namespaces={i18nNamespaces}
        locale={locale}
        resources={resources}
      >
        {/*<Suspense>
          <Navbar />
        </Suspense>*/}
        <Suspense>{children}</Suspense>
        {/*<Suspense>
          <Footer />
        </Suspense>*/}
        {draftMode().isEnabled && <VisualEditing />}
      </TranslationsProvider>
    </>
  )
}
