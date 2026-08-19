import initTranslations from '@/app/i18n'
import TranslationsProvider from '@/components/data/TranslationsProvider'
import { GlobalHeader } from '@/components/global/GlobalHeader'
import { Toaster } from '@/components/ui/toaster'
import { sanityFetch } from '@/sanity/lib/live'
import {
  homePageQuery,
  settingsQuery,
  visibleFontsQuery,
} from '@/sanity/lib/queries'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import i18nConfig from '../../../../i18nConfig'
import { Metadata, ResolvingMetadata, Viewport } from 'next'
import { toPlainText, type PortableTextBlock } from 'next-sanity'
import { Suspense } from 'react'
const i18nNamespaces = ['common']

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const [{ settings }, { homePage }] = await Promise.all([
    // sanityFetch<SettingsQueryResult>({
    sanityFetch({
      query: settingsQuery,
      stega: false,
    }),
    // sanityFetch<HomePageQueryResult>({ query: homePageQuery }),
    sanityFetch({ query: homePageQuery, stega: false }),
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

export function generateStaticParams() {
  return i18nConfig.locales.map((locale: string) => ({ locale }))
}

export default async function LocaleRoute({
  children,
  buy,
  params,
}: {
  children: React.ReactNode
  buy: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const fontData = await sanityFetch({ query: visibleFontsQuery })
  const { t, resources } = await initTranslations(locale, i18nNamespaces)
  return (
    <>
      <TranslationsProvider
        namespaces={i18nNamespaces}
        locale={locale}
        resources={resources}
      >
        <GlobalHeader fonts={fontData.data} />
        <Suspense>{children}</Suspense>
        {buy}
        <Toaster />
      </TranslationsProvider>
    </>
  )
}
