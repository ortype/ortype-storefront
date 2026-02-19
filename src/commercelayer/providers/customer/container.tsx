import { CustomerContainer } from '@commercelayer/react-components/customers/CustomerContainer'
import type { Settings } from 'CustomApp'
import { useIdentityContext } from '../identity'

type CustomerContainerProviderProps = Pick<Settings, 'isGuest'> & {
  children: JSX.Element | JSX.Element[] | null
}

// @TODO: in this file recreate `@commercelayer/react-components/customers/CustomerContainer`
// and drop the `isGuest` conditional

export function CustomerContainerProvider({
  children,
  isGuest,
}: CustomerContainerProviderProps): JSX.Element {
  const { clientConfig, settings } = useIdentityContext()
  return isGuest ? (
    <>{children}</>
  ) : (
    <CustomerContainer customerId={settings.customerId} config={clientConfig}>
      {children}
    </CustomerContainer>
  )
}

export default CustomerContainerProvider
