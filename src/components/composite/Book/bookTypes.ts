export type BlockParams = {
  blockId: string
  variantId?: string
  fontSize: number
  lineHeight: number
  lineGap: number
  marginBottom: number
  wordCount: number
  lineCount: number
  regex: string
  noSpace: boolean
  isParagraph: boolean
  entry?: string
}

export type LineParams = BlockParams & {
  entry?: string
  dedupId?: string
  variantId?: string
  colWidth: number
}

// contentArea: (Number(ascent.value) + Number(descent.value)) / 1000,
// distanceTop: (Number(ascent.value) - Number(capHeight.value)) / 1000,
export type Metrics = {
  unitsPerEm: number
  lineGap: number
  capHeight: number
  ascent: number
  contentArea: number // metafields.ascent - metafields.descent
  distanceTop: number // metafields.ascent - metafields.capHeight
  descent: number // metafields.descender
}

export type BlockStyleParams = Pick<
  BlockParams,
  'fontSize' | 'lineHeight' | 'lineCount' | 'lineGap' | 'marginBottom'
>

export type BlockStyleOptions = Pick<
  Metrics,
  'contentArea' | 'distanceTop' | 'ascent' | 'capHeight' | 'descent'
> & {
  difference: number
  conversion: number
}

export type BlockStyle = {
  transformValue: number
  outerWrapperMarginTop: string
  outerWrapperMarginBottom: string
  innerWrapperStyle: {
    lineHeight: string
    height: string
    fontSize: string
  }
  offsetValue: string
  conversion: number
}

export type Update = {
  entry: string
  page: string // 'recto' or 'verso'
  col: number // column index
  block: number | null // block index
}

export type ColumnProps = {
  defaultVariantId?: string
  width: number
  conversion: number
  blocks: BlockParams[]
  update: Update
}
