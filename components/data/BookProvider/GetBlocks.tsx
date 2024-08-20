import { useQuery } from '@apollo/client'
import Block from 'components/composite/Book'
import {
  type BlockStyle,
  type LineParams,
  type Update,
} from 'components/composite/Book/bookTypes'
import { GET_BOOK_ITEM } from 'graphql/queries'
import React, { useContext, useEffect } from 'react'
import { useEditState } from 'sanity'
import { useBookLayoutStore } from './'

type GetBlocksProps = {
  component: React.ComponentType<any>
  line: Pick<
    LineParams,
    'entry' | 'dedupId' | 'regex' | 'lineCount' | 'wordCount' | 'colWidth'
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
      colWidth: colWidth, // - 5, // @TODO: why -5 (?)
      text,
    }
  }

  const { loading, data, previousData, refetch } = useQuery(GET_BOOK_ITEM, {
    variables: variables(),
    // @TODO: check on fetch policy regarding caching
    // https://www.apollographql.com/docs/react/data/queries/#setting-a-fetch-policy
    // the default cache policy is ideal in this case, where only if variables change
    // then the cache should be invalidated, so using the bookLayout ID as part of
    // the dedupId will refetch on layout change
  })

  return (
    <Component
      line={line}
      update={update}
      layout={layout}
      isLoadingBookItem={loading}
      refetch={refetch}
      entry={data?.bookItem?.entry}
    />
  )
}

export default GetBlocks
