import initTranslations from '@/app/i18n'
import TranslationsProvider from '@/components/data/TranslationsProvider'
import { GlobalHeader } from '@/components/global/GlobalHeader'
import { Toaster } from '@/components/ui/toaster'
import { sanityFetch } from '@/sanity/lib/live'
import { homePageQuery, settingsQuery } from '@/sanity/lib/queries'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import { Metadata, Viewport } from 'next'
import { toPlainText, type PortableTextBlock } from 'next-sanity'
import { Suspense } from 'react'
const i18nNamespaces = ['common']

export async function generateMetadata(): Promise<Metadata> {
  const [{ settings }, { homePage }] = await Promise.all([
    // sanityFetch<SettingsQueryResult>({
    sanityFetch({
      query: settingsQuery,
    }),
    // sanityFetch<HomePageQueryResult>({ query: homePageQuery }),
    sanityFetch({ query: homePageQuery }),
  ])

  const ogImage = resolveOpenGraphImage(settings?.coverImage)
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
  params,
}: {
  children: React.ReactNode
  params: {
    locale: string
  }
}) {
  const { locale } = await params

  const { t, resources } = await initTranslations(locale, i18nNamespaces)
  return (
    <>
      <TranslationsProvider
        namespaces={i18nNamespaces}
        locale={locale}
        resources={resources}
      >
        <GlobalHeader />
        <Suspense>{children}</Suspense>
        <Toaster />
      </TranslationsProvider>
    </>
  )
}
