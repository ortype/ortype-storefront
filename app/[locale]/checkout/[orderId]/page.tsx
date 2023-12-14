import initTranslations from '@/app/i18n'
import TranslationsProvider from '@/components/data/TranslationsProvider'
import { NextPage } from 'next'
import OrderComponent from './OrderId'
const i18nNamespaces = ['common']

const Order: NextPage = async ({ params: { locale } }) => {
  const { t, resources } = await initTranslations(locale, i18nNamespaces)
  // <h1>{t('header')}</h1>
  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}
    >
      <OrderComponent />
    </TranslationsProvider>
  )
}

export default Order
