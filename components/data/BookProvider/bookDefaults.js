// Math.random should be unique because of its seeding algorithm.
// Convert it to base 36 (numbers + letters), and grab the first 9 characters
// after the decimal.
const uuid = () => Math.random().toString(36).substr(2, 9)

const DEFAULT_BLOCK = {
  fontSize: 80,
  marginBottom: 0,
  lineGap: 0,
  wordCount: 1,
  lineCount: 1,
  regex: 'capitalize',
  noSpace: true,
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

const regexOptions = [
  {
    value: 'uppercase',
    label: 'Uppercase',
  },
  {
    value: 'lowercase',
    label: 'Lowercase',
  },
  {
    value: 'sentence',
    label: 'Sentence',
  },
  {
    value: 'capitalize',
    label: 'Capitalize',
  },
  /*
  // @TODO: verify that there is indeed not enough entries consisting of 
  // digits for  this feature to be removed
  {
    value: 'numbers',
    label: 'Numbers',
  },*/
]

export { uuid, defaultBlock, defaultColumn, regexOptions }
