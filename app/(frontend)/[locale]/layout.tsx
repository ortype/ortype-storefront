import { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'
import initTranslations from '@/app/i18n'
import TranslationsProvider from '@/components/data/TranslationsProvider'
import { VisualEditing, toPlainText, type PortableTextBlock } from 'next-sanity'

// import { Footer } from '@/components/global/Footer'
// import { Navbar } from '@/components/global/Navbar'
import { homePageQuery, settingsQuery } from 'lib/sanity.queries'
// @TODO: typegen
// import type { HomePageQueryResult, SettingsQueryResult } from "@/sanity.types"
import { resolveOpenGraphImage } from '@/lib/sanity.utils'
import AlertBanner from '../alertBanner'
const i18nNamespaces = ['common']
import { sanityFetch } from '@/sanity/lib/fetch'

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
        {draftMode().isEnabled && <AlertBanner />}
        <Suspense>{children}</Suspense>
        {/*<Suspense>
          <Footer />
        </Suspense>*/}
        {draftMode().isEnabled && <VisualEditing />}
      </TranslationsProvider>
    </>
  )
}
