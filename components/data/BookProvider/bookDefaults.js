// Math.random should be unique because of its seeding algorithm.
// Convert it to base 36 (numbers + letters), and grab the first 9 characters
// after the decimal.
const uuid = () => Math.random().toString(36).substr(2, 9)

const DEFAULT_BLOCK = {
  fontSize: 80,
  wordCount: 1,
  lineCount: 1,
  regex: 'all',
  noSpace: false,
  noGibberish: false,
  isParagraph: false,
}

const DEFAULT_COLUMN = {
  width: 50,
}

const defaultBlock = () => ({
  ...DEFAULT_BLOCK,
  blockId: `block_${uuid()}`,
})

const defaultColumn = () => ({
  ...DEFAULT_COLUMN,
  blocks: [defaultBlock()],
  colId: `col_${uuid()}`,
})

export { uuid, defaultBlock, defaultColumn }
