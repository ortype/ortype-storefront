import {
  type ReactNode,
  useContext,
  createContext,
  useEffect,
  useReducer,
  type JSX,
} from 'react'
import {
  ActionType,
  addressInitialState,
  type AddressResource,
  setAddressErrors,
  type SetAddressParams,
  setCloneAddress,
  saveAddresses,
  type ICustomerAddress,
  type AddressState,
  setAddress,
  reducer as addressReducer,
} from './reducer'
import type { BaseError } from '../customer'
import { setCustomerOrderParam } from '@/utils/localStorage'
import type { TCustomerAddress } from '../customer/reducer'
import { useOrderContext } from '../Order'
import { useIdentityContext } from '../identity'

import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'

interface Props {
  children: ReactNode
  /**
   * If true, the shipping address will be considered. Default is false.
   */
  shipToDifferentAddress?: boolean
  /**
   * If true, the address will be considered a business address.
   */
  isBusiness?: boolean
  /**
   * If true, the shipping address will be considered as primary address. Default is false.
   */
  invertAddresses?: boolean
}

type DefaultContext = {
  saveAddresses?: (params: {
    customerEmail?: string
    customerAddress?: ICustomerAddress
  }) => ReturnType<typeof saveAddresses>
  setCloneAddress: (id: string, resource: AddressResource) => void
  setAddress: typeof setAddress
  setAddressErrors: (errors: BaseError[], resource: AddressResource) => void
} & AddressState

export const defaultAddressContext = {
  setCloneAddress: () => {},
  setAddress,
  setAddressErrors: () => {},
}

export const AddressesContext = createContext<DefaultContext>(
  defaultAddressContext
)

export const useAddressesContext = () => {
  const context = useContext(AddressesContext)
  if (!context) {
    throw new Error('useCustomerContext must be used within a CustomerProvider')
  }
  return context
}

/**
 * Main container for the Addresses components.
 * It provides demanded functionalities to show/manage an address or a series of addresses depending on the context in use.
 * In addition it provides order oriented functionalities to manage billing and shipping addresses.
 *
 * It accept:
 * - a `shipToDifferentAddress` prop to define if the order related shipping address will be different from the billing one.
 * - a `isBusiness` prop to define if the current address needs to be threated as a `business` address during creation/update.
 *
 * <span title='Requirements' type='warning'>
 * Must be a child of the `<CommerceLayer>` component.
 * </span>
 * <span title='Children' type='info'>
 * `<BillingAddressContainer>`,
 * `<BillingAddressForm>`,
 * `<ShippingAddressContainer>`,
 * `<ShippingAddressForm>`,
 * `<CustomerAddressForm>`,
 * `<AddressesEmpty>`,
 * `<Addresses>`
 * </span>
 */
export function AddressesContainer(props: Props): JSX.Element {
  const {
    children,
    shipToDifferentAddress = false,
    isBusiness,
    invertAddresses = false,
  } = props
  const [state, dispatch] = useReducer(addressReducer, addressInitialState)
  const { order, orderId, updateOrder } = useOrderContext()
  const { clientConfig: config } = useIdentityContext()

  const { accessToken } = config

  const cl = isValidCommerceLayerConfig(config)
    ? getCommerceLayer(config)
    : undefined

  useEffect(() => {
    setCustomerOrderParam(
      '_save_billing_address_to_customer_address_book',
      'false'
    )
    setCustomerOrderParam(
      '_save_shipping_address_to_customer_address_book',
      'false'
    )
  }, [])
  useEffect(() => {
    dispatch({
      type: ActionType.SET_SHIP_TO_DIFFERENT_ADDRESS,
      payload: {
        shipToDifferentAddress,
        isBusiness,
        invertAddresses,
      },
    })
    return () => {
      dispatch({
        type: ActionType.CLEANUP,
      })
    }
  }, [shipToDifferentAddress, isBusiness, invertAddresses])
  const contextValue = {
    ...state,
    setAddressErrors: (errors: BaseError[], resource: AddressResource) => {
      setAddressErrors({
        errors,
        resource,
        dispatch,
        currentErrors: state.errors,
      })
    },
    setAddress: (params: SetAddressParams<TCustomerAddress>) => {
      defaultAddressContext.setAddress({ ...params, dispatch })
    },
    saveAddresses: async (params: {
      customerEmail?: string
      customerAddress?: ICustomerAddress
    }): ReturnType<typeof saveAddresses> =>
      await saveAddresses({
        cl,
        config,
        dispatch,
        updateOrder,
        order,
        orderId,
        state,
        ...params,
      }),
    setCloneAddress: (id: string, resource: AddressResource): void => {
      setCloneAddress(id, resource, dispatch)
    },
  }
  return (
    <AddressesContext.Provider value={contextValue}>
      {children}
    </AddressesContext.Provider>
  )
}

export default AddressesContainer
