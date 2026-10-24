'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

interface BuyDialogVisibility {
  hasFinishedEntering: boolean
  setHasFinishedEntering: Dispatch<SetStateAction<boolean>>
}

const BuyDialogVisibilityContext = createContext<BuyDialogVisibility | null>(
  null
)

export function BuyDialogVisibilityProvider({
  children,
}: {
  children: ReactNode
}) {
  const [hasFinishedEntering, setHasFinishedEntering] = useState(false)
  const value = useMemo(
    () => ({ hasFinishedEntering, setHasFinishedEntering }),
    [hasFinishedEntering]
  )

  return (
    <BuyDialogVisibilityContext.Provider value={value}>
      {children}
    </BuyDialogVisibilityContext.Provider>
  )
}

export function useBuyDialogVisibility() {
  const context = useContext(BuyDialogVisibilityContext)
  if (!context) {
    throw new Error(
      'useBuyDialogVisibility must be used within BuyDialogVisibilityProvider'
    )
  }
  return context
}
