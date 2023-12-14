import CommerceLayer from '@commercelayer/react-components/auth/CommerceLayer'
import { CheckoutHead } from 'components/composite/CheckoutTitle'
import { CheckoutProvider } from 'components/data/CheckoutProvider'
// import { GTMProvider } from 'components/data/GTMProvider'

interface Props {
  settings: CheckoutSettings
  children: JSX.Element[] | JSX.Element
}

const CheckoutContainer = ({ settings, children }: Props): JSX.Element => {
  return (
    <div>
      {/*
        // We wrap CommerceLayer at the _app level with a different import `import { CommerceLayer } from '@commercelayer/react-components'
        // without `@commercelayer/react-components/auth/CommerceLayer` we get an error from the SDK
        // what's the difference?
      */}
      <CommerceLayer
        accessToken={settings.accessToken}
        endpoint={settings.endpoint}
      >
        <CheckoutProvider
          orderId={settings.orderId}
          accessToken={settings.accessToken}
          slug={settings.slug}
          domain={settings.domain}
        >
          {/*<GTMProvider gtmId={settings.gtmId}></GTMProvider>*/}
          {children}
        </CheckoutProvider>
      </CommerceLayer>
    </div>
  )
}

export default CheckoutContainer
