export const SPECIMENS_ID = 'specimens'
// Match the section's Chakra md breakpoint: below it, pages become mobile slides.
export const SPECIMEN_DESKTOP_QUERY = '(min-width: 48rem)'

// Coordinates used when authoring book snapshots, not fixed browser dimensions.
// Typography, gutters and margins all scale from the rendered width of ONE page.
export const BOOK_PAGE = {
  width: 680,
  height: 930,
  margin: 46,
  columnWidth: 558,
} as const

// A spread is always two portrait pages, even in the smaller Overview tiles.
// CSS aspect-ratio is width / height, unlike the legacy percentage-padding helper.
export const SPREAD_RATIO = (BOOK_PAGE.width * 2) / BOOK_PAGE.height
export const PAGE_RATIO = BOOK_PAGE.width / BOOK_PAGE.height
// Reserve room for fixed navigation and breathing space above/below the paper.
export const SPECIMEN_VIEWPORT_CLEARANCE = 160

export type SpecimenMode = 'overview' | 'spreads' | 'pages'

export function getSpreadWidth(
  mode: SpecimenMode,
  containerWidth: number,
  viewportHeight: number,
  gap: number
) {
  // Overview fits two complete spreads and their gutter into the content width.
  if (mode === 'overview') return Math.max(0, (containerWidth - gap) / 2)
  // Spreads must fit BOTH axes: wide windows can be height-constrained.
  // Pages reuses this outer width for the same side margins, but gives that
  // entire width to one portrait page; its height can exceed the viewport.
  return Math.min(
    containerWidth,
    Math.max(0, viewportHeight - SPECIMEN_VIEWPORT_CLEARANCE) * SPREAD_RATIO
  )
}
