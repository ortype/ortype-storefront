export type BlockParams = {
  blockId: string
  variantId: string | null
  fontSize: number
  lineHeight: number
  wordCount: number
  lineCount: number
  regex: string
  noSpace: boolean
  noGibberish: boolean
  isParagraph: boolean
}

export type LineParams = BlockParams & {
  dedupId: string
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
  'fontSize' | 'lineHeight' | 'lineCount'
>

export type BlockStyleOptions = Pick<
  Metrics,
  'contentArea' | 'distanceTop' | 'ascent' | 'capHeight' | 'descent'
> & {
  difference: number
}

export type BlockStyle = {
  transformValue: number
  outerWrapperMarginTop: string
  innerWrapperStyle: {
    lineHeight: string
    height: string
    fontSize: string
  }
  offsetValue: string
}

export type Update = {
  page: string // 'recto' or 'verso'
  col: number // column index
  block: number | null // block index
}

export type ColumnProps = {
  width: number
  blocks: BlockParams[]
  update: Update
}
