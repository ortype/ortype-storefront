import { useQuery } from '@apollo/client'
import Block from 'components/composite/Book'
import {
  type BlockStyle,
  type LineParams,
  type Update,
} from 'components/composite/Book/bookTypes'
import { GET_BOOK_ITEM } from 'graphql/queries'
import React from 'react'

type GetBlocksProps = {
  component: React.ComponentType<any>
  line: Pick<
    LineParams,
    'dedupId' | 'regex' | 'lineCount' | 'wordCount' | 'colWidth'
  >
  update: Update
  layout: BlockStyle
}

const GetBlocks = (props: GetBlocksProps) => {
  const { component: Component, line, update, layout } = props

  const variables = () => {
    const { dedupId, regex, lineCount, wordCount, colWidth } = line

    const text = Array.from({ length: lineCount }, () => ({
      words: Array.from({ length: wordCount }, (_word, wordIdx) => ({
        regex,
        dedupId: `${dedupId}-W${wordIdx}`,
      })),
    }))

    return {
      ...line,
      colWidth: colWidth - 5,
      text,
    }
  }

  const { loading, data, fetchMore } = useQuery(GET_BOOK_ITEM, {
    variables: variables(),
  })

  return (
    <Component
      line={line}
      update={update}
      layout={layout}
      isLoadingBookItem={loading}
      fetchMore={fetchMore}
      entry={data && data.bookItem && data.bookItem.entry}
    />
  )
}

export default GetBlocks
