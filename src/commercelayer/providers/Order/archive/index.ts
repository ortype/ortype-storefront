/**
 * ARCHIVE: retired selections sync (localStorage + order metadata)
 * ================================================================
 *
 * Nothing in the app imports from this folder. It is kept (and type-checked,
 * so it doesn't rot) purely as a reference for how the old design worked, in
 * case a "draft cart that survives reloads / devices" feature is ever needed
 * again.
 *
 * How it was wired into `OrderProvider`
 * -------------------------------------
 * Before the cart had an explicit commit step, cart selections only existed in
 * the reducer (`state.selections`, plus `state.committedGroups` tracking which
 * line items had been pushed to Commerce Layer). Because they were transient,
 * they were mirrored in the background:
 *
 *  1. localStorage (`selections-local-storage.ts`): synchronous write on every
 *     change; hydrated first on load.
 *  2. order.metadata (`order-metadata-sync.ts`): debounced write of
 *     `cart_selections` / `cart_committed_groups` (+ `license`); hydrated as a
 *     fallback when localStorage had no entry (new device).
 *
 * The cart page edited `selections` only; line items were reconciled lazily by
 * `commitSelections()` when "Proceed to checkout" was clicked.
 *
 * Why it was retired
 * ------------------
 * The /buy dialog gained an explicit "Add to cart / Update cart" commit point,
 * so selections now live on the Commerce Layer order itself. Keeping two
 * mirrors of that state meant they could drift from the real line items (a
 * font removed in the cart stayed on the order because the checkout
 * reconciliation never ran, and `/checkout/:orderId` could be opened directly
 * with stale items). Metadata also has a size limit that a whole-cart JSON
 * blob can exceed, and sync errors were swallowed.
 *
 * What replaced it
 * ----------------
 *  - `../derive-selections.ts`: `selections` / `committedGroups` /
 *    group resolutions are derived from `order.line_items`.
 *  - `../mutation-queue.ts`: cart edits write through to Commerce Layer,
 *    serialized through one queue, with an optimistic overlay.
 *  - A tiny license-only write (`order.metadata.license`: owner / size /
 *    types) remains in `OrderProvider`.
 *
 * The git tag `archive/selections-sync` is suggested on the last commit that
 * still has this wired into `OrderProvider`.
 */
export * from './order-metadata-sync'
export * from './selections-local-storage'
