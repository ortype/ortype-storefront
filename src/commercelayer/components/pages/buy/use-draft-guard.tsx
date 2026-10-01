'use client'

import DiscardDraftDialog from '@/commercelayer/components/pages/buy/discard-draft-dialog'
import {
  useBuyContext,
  type CommitResult,
} from '@/commercelayer/providers/buy'
import { BuyFontsQueryResult, Font } from '@/types'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'

/**
 * Discard / save-and-proceed guard for the buy dialog's unsaved draft.
 *
 * Layout:
 *
 *   BuyDialog
 *   └─ DraftGuardProvider        owns the pending action + dialog state
 *      ├─ BuyNav, close handler  call `guard` / `guardedLinkClick`
 *      ├─ <DraftGuardDialog />   the single dialog instance
 *      └─ BuyContainer
 *         └─ BuyProvider         owns the draft
 *            └─ DraftGuardRegistrar   mirrors the draft into the guard
 *
 * The provider sits ABOVE `BuyProvider` because the close handler and
 * `BuyNav` live outside it and can't read `useBuyContext`. The registrar
 * (inside `BuyProvider`) is the bridge: it hands the guard the latest
 * `isDirty` / `canCommit` / `commit`, and unregisters when the provider
 * unmounts (dialog closed, font switched), so the guard is inert whenever
 * there is no draft.
 *
 * Reload, tab close and browser back are deliberately NOT guarded: the draft
 * is plain component state, so they are an implicit discard.
 */

export interface DraftRegistration {
  /** Draft differs from the cart (unsaved edits or a pending removal) */
  isDirty: boolean
  /** The dirty draft can be written to the cart right now */
  canCommit: boolean
  isCommitted: boolean
  commit: () => Promise<CommitResult>
}

interface DraftGuardContextValue {
  /** Called by the registrar; keeps the latest draft state */
  update: (draft: DraftRegistration) => void
  /** Called by the registrar on unmount; also drops any pending prompt */
  clear: () => void
  /** True when an action should be intercepted (synchronous, for Links) */
  needsGuard: () => boolean
  /**
   * Run `action` now if the draft is clean; otherwise open the dialog and
   * hold `action` until the user picks Discard or Save. Returns whether the
   * action ran immediately.
   */
  guard: (action: () => void) => boolean
  // Dialog state, consumed by <DraftGuardDialog />
  isOpen: boolean
  canSave: boolean
  isSaving: boolean
  isCommitted: boolean
  error?: string
  discard: () => void
  save: () => void
  dismiss: () => void
}

// Safe outside a provider: nothing is guarded and `action` runs immediately.
const DraftGuardContext = createContext<DraftGuardContextValue>({
  update: () => {},
  clear: () => {},
  needsGuard: () => false,
  guard: (action) => {
    action()
    return true
  },
  isOpen: false,
  canSave: false,
  isCommitted: false,
  isSaving: false,
  error: undefined,
  discard: () => {},
  save: () => {},
  dismiss: () => {},
})

export function DraftGuardProvider({ children }: { children: ReactNode }) {
  // Read at click time, so a ref (no re-render per draft change)
  const draftRef = useRef<DraftRegistration | null>(null)

  const [pending, setPending] = useState<{ action: () => void } | null>(null)
  // Kept after the dialog closes so the buttons don't change mid exit-animation
  const [canSave, setCanSave] = useState(false)
  const [isCommitted, setIsCommitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const reset = useCallback(() => {
    setPending(null)
    setError(undefined)
  }, [])

  const update = useCallback((draft: DraftRegistration) => {
    draftRef.current = draft
  }, [])

  const clear = useCallback(() => {
    draftRef.current = null
    // The draft is gone (dialog closed / browser back): drop a stale prompt
    reset()
  }, [reset])

  const needsGuard = useCallback(() => !!draftRef.current?.isDirty, [])

  const guard = useCallback((action: () => void) => {
    const draft = draftRef.current
    if (!draft?.isDirty) {
      action()
      return true
    }
    setCanSave(draft.canCommit)
    setIsCommitted(draft.isCommitted)
    // A prompt is already open: keep the first action
    setPending((prev) => prev ?? { action })
    return false
  }, [])

  const discard = useCallback(() => {
    const action = pending?.action
    reset()
    action?.()
  }, [pending, reset])

  const save = useCallback(async () => {
    const draft = draftRef.current
    if (!pending || !draft) return
    const { action } = pending
    setIsSaving(true)
    setError(undefined)
    try {
      const result = await draft.commit()
      if (result.success) {
        reset()
        action()
      } else {
        // Stay open so the user can retry, discard or dismiss
        setError(
          result.error?.message ??
            'Could not update your cart. Please try again.'
        )
      }
    } finally {
      setIsSaving(false)
    }
  }, [pending, reset])

  const dismiss = useCallback(() => {
    if (!isSaving) reset()
  }, [isSaving, reset])

  const value = useMemo<DraftGuardContextValue>(
    () => ({
      update,
      clear,
      needsGuard,
      guard,
      isOpen: !!pending,
      canSave,
      isSaving,
      isCommitted,
      error,
      discard,
      save,
      dismiss,
    }),
    [
      update,
      clear,
      needsGuard,
      guard,
      pending,
      canSave,
      isSaving,
      isCommitted,
      error,
      discard,
      save,
      dismiss,
    ]
  )

  return (
    <DraftGuardContext.Provider value={value}>
      {children}
    </DraftGuardContext.Provider>
  )
}

/**
 * The one dialog instance. Render it INSIDE the parent `DialogContent` so its
 * `portalled={false}` nesting keeps the parent from treating clicks as
 * "interact outside".
 */
export function DraftGuardDialog({
  font,
}: {
  font: BuyFontsQueryResult['font']
}) {
  const {
    isOpen,
    canSave,
    isSaving,
    isCommitted,
    error,
    discard,
    save,
    dismiss,
  } = useContext(DraftGuardContext)
  return (
    <DiscardDraftDialog
      open={isOpen}
      canSave={canSave}
      isSaving={isSaving}
      error={error}
      onDiscard={discard}
      onSave={save}
      onDismiss={dismiss}
      isCommitted={isCommitted}
      font={font}
    />
  )
}

/**
 * Render once inside `BuyProvider`. Mirrors the draft into the guard.
 */
export function DraftGuardRegistrar() {
  const { isDirty, canCommit, commit, isCommitted } = useBuyContext()
  const { update, clear } = useContext(DraftGuardContext)

  useEffect(() => {
    update({ isDirty, canCommit, commit, isCommitted })
  }, [update, isDirty, canCommit, commit, isCommitted])

  // Separate effect so the guard is cleared only on unmount, not on every
  // draft change (which would dismiss an open prompt mid-save).
  useEffect(() => clear, [clear])

  return null
}

export function useDraftGuard() {
  const { guard, needsGuard } = useContext(DraftGuardContext)
  const router = useRouter()

  /**
   * `onClick` for a `Link`: when the draft is dirty, cancel the native
   * navigation and replay it via `router.push` once the user has chosen.
   * Modified clicks (new tab / window) are left alone, since the draft lives
   * in this tab and nothing is lost.
   */
  const guardedLinkClick = useCallback(
    (e: MouseEvent<HTMLElement>, href: string) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }
      if (!needsGuard()) return
      e.preventDefault()
      guard(() => router.push(href))
    },
    [guard, needsGuard, router]
  )

  return { guard, needsGuard, guardedLinkClick }
}
