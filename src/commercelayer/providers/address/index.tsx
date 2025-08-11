import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
  type FC,
} from 'react'
import type { AddressCreate, CommerceLayerClient } from '@commercelayer/sdk'

import { useIdentityContext } from '@/commercelayer/providers/Identity'
import getCommerceLayer from '@/commercelayer/utils/getCommerceLayer'
import {
  createBillingAddress,
  updateBillingAddress,
  setOrderBillingAddress,
  validateAddress,
  transformAddressErrors,
  type AddressError,
  type AddressErrorResponse,
  type AddressOperationResult,
} from '@/commercelayer/utils/address'

// Use AddressCreate from Commerce Layer SDK as AddressInput
export type AddressInput = AddressCreate

export interface AddressErrors {
  [field: string]: string[]
}

export interface AddressState {
  billing: Partial<AddressInput>
  errors: AddressErrors
  isLoading: boolean
}

export interface AddressActions {
  saveBillingAddress: (params: {
    addressData: Partial<AddressInput>
    orderId?: string
    useAsShipping?: boolean
  }) => Promise<AddressOperationResult & { order?: any }>
  updateBillingAddressData: (data: Partial<AddressInput>) => void
  setErrors: (errors: AddressErrors) => void
  clearErrors: () => void
  setLoading: (loading: boolean) => void
}

export interface AddressProviderData extends AddressState, AddressActions {}

// Action types for reducer
enum ActionType {
  SET_BILLING_ADDRESS = 'SET_BILLING_ADDRESS',
  SET_ERRORS = 'SET_ERRORS',
  CLEAR_ERRORS = 'CLEAR_ERRORS',
  SET_LOADING = 'SET_LOADING',
}

interface SetBillingAddressAction {
  type: ActionType.SET_BILLING_ADDRESS
  payload: Partial<AddressInput>
}

interface SetErrorsAction {
  type: ActionType.SET_ERRORS
  payload: AddressErrors
}

interface ClearErrorsAction {
  type: ActionType.CLEAR_ERRORS
}

interface SetLoadingAction {
  type: ActionType.SET_LOADING
  payload: boolean
}

type AddressAction =
  | SetBillingAddressAction
  | SetErrorsAction
  | ClearErrorsAction
  | SetLoadingAction

const initialState: AddressState = {
  billing: {},
  errors: {},
  isLoading: false,
}

const addressReducer = (
  state: AddressState,
  action: AddressAction
): AddressState => {
  switch (action.type) {
    case ActionType.SET_BILLING_ADDRESS:
      return {
        ...state,
        billing: {
          ...state.billing,
          ...action.payload,
        },
      }

    case ActionType.SET_ERRORS:
      return {
        ...state,
        errors: action.payload,
      }

    case ActionType.CLEAR_ERRORS:
      return {
        ...state,
        errors: {},
      }

    case ActionType.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    default:
      return state
  }
}

const AddressContext = createContext<AddressProviderData | null>(null)

export const useAddressState = (): AddressState => {
  const context = useContext(AddressContext)
  if (!context) {
    throw new Error('useAddressState must be used within AddressProvider')
  }
  
  return {
    billing: context.billing,
    errors: context.errors,
    isLoading: context.isLoading,
  }
}

export const useAddressActions = (): AddressActions => {
  const context = useContext(AddressContext)
  if (!context) {
    throw new Error('useAddressActions must be used within AddressProvider')
  }

  return {
    saveBillingAddress: context.saveBillingAddress,
    updateBillingAddressData: context.updateBillingAddressData,
    setErrors: context.setErrors,
    clearErrors: context.clearErrors,
    setLoading: context.setLoading,
  }
}

interface AddressProviderProps {
  children: ReactNode
}

export const AddressProvider: FC<AddressProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(addressReducer, initialState)
  const { clientConfig } = useIdentityContext()

  const getCommerceLayerClient = useCallback((): CommerceLayerClient | null => {
    if (!clientConfig) {
      return null
    }
    return getCommerceLayer(clientConfig)
  }, [clientConfig])

  const updateBillingAddressData = useCallback(
    (data: Partial<AddressInput>) => {
      dispatch({
        type: ActionType.SET_BILLING_ADDRESS,
        payload: data,
      })
    },
    []
  )

  const clearErrors = useCallback(() => {
    dispatch({ type: ActionType.CLEAR_ERRORS })
  }, [])

  const setErrors = useCallback((errors: AddressErrors) => {
    dispatch({
      type: ActionType.SET_ERRORS,
      payload: errors,
    })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({
      type: ActionType.SET_LOADING,
      payload: loading,
    })
  }, [])

  const saveBillingAddress = useCallback(
    async (params: {
      addressData: Partial<AddressInput>
      orderId?: string
      useAsShipping?: boolean
    }): Promise<AddressOperationResult & { order?: any }> => {
      const { addressData, orderId, useAsShipping = false } = params

      dispatch({ type: ActionType.SET_LOADING, payload: true })
      dispatch({ type: ActionType.CLEAR_ERRORS })

      try {
        const cl = getCommerceLayerClient()
        if (!cl) {
          const error = {
            success: false,
            error: {
              errors: [
                {
                  title: 'Commerce Layer client not available',
                  detail: 'Commerce Layer client not available',
                  code: 'MISSING_CLIENT',
                },
              ] as AddressError[],
            } as AddressErrorResponse,
          }

          const { fieldErrors } = transformAddressErrors(error.error)
          const errorsObject: AddressErrors = {}
          fieldErrors.forEach(({ field, message }) => {
            if (!errorsObject[field]) {
              errorsObject[field] = []
            }
            errorsObject[field].push(message)
          })
          dispatch({ type: ActionType.SET_ERRORS, payload: errorsObject })

          return error
        }

        // First validate the address data locally
        const validationResult = validateAddress({ addressData })
        if (!validationResult.success) {
          const { fieldErrors } = transformAddressErrors(validationResult.error)
          const errorsObject: AddressErrors = {}
          fieldErrors.forEach(({ field, message }) => {
            if (!errorsObject[field]) {
              errorsObject[field] = []
            }
            errorsObject[field].push(message)
          })
          dispatch({ type: ActionType.SET_ERRORS, payload: errorsObject })
          return validationResult
        }

        // Create the billing address
        const createResult = await createBillingAddress({
          cl,
          addressData: addressData as AddressCreate,
        })

        if (!createResult.success) {
          const { fieldErrors } = transformAddressErrors(createResult.error)
          const errorsObject: AddressErrors = {}
          fieldErrors.forEach(({ field, message }) => {
            if (!errorsObject[field]) {
              errorsObject[field] = []
            }
            errorsObject[field].push(message)
          })
          dispatch({ type: ActionType.SET_ERRORS, payload: errorsObject })
          return createResult
        }

        // Update local state with the created address
        if (createResult.data) {
          dispatch({
            type: ActionType.SET_BILLING_ADDRESS,
            payload: createResult.data,
          })
        }

        // If orderId is provided, attach the address to the order
        if (orderId && createResult.data?.id) {
          const setOrderResult = await setOrderBillingAddress({
            cl,
            orderId,
            addressId: createResult.data.id,
            useAsShipping,
          })

          if (!setOrderResult.success) {
            const { fieldErrors, generalErrors } = transformAddressErrors(
              setOrderResult.error
            )
            const errorsObject: AddressErrors = {}
            fieldErrors.forEach(({ field, message }) => {
              if (!errorsObject[field]) {
                errorsObject[field] = []
              }
              errorsObject[field].push(message)
            })
            // Add general errors to a special field
            if (generalErrors.length > 0) {
              errorsObject._general = generalErrors
            }
            dispatch({ type: ActionType.SET_ERRORS, payload: errorsObject })
            return setOrderResult
          }

          // Return the create result with the updated order from setOrderResult
          return {
            ...createResult,
            order: setOrderResult.data // The updated order from setOrderBillingAddress
          }
        }

        return createResult
      } catch (error) {
        const errorResult = {
          success: false,
          error,
        } as AddressOperationResult

        const { fieldErrors, generalErrors } = transformAddressErrors(error)
        const errorsObject: AddressErrors = {}
        fieldErrors.forEach(({ field, message }) => {
          if (!errorsObject[field]) {
            errorsObject[field] = []
          }
          errorsObject[field].push(message)
        })
        if (generalErrors.length > 0) {
          errorsObject._general = generalErrors
        }
        dispatch({ type: ActionType.SET_ERRORS, payload: errorsObject })

        return errorResult
      } finally {
        dispatch({ type: ActionType.SET_LOADING, payload: false })
      }
    },
    [getCommerceLayerClient]
  )

  const value: AddressProviderData = {
    // State
    billing: state.billing,
    errors: state.errors,
    isLoading: state.isLoading,
    // Actions
    saveBillingAddress,
    updateBillingAddressData,
    setErrors,
    clearErrors,
    setLoading,
  }

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  )
}
