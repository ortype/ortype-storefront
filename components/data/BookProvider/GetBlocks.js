import { useQuery } from '@apollo/client'
import Block from 'components/composite/Book'
import { GET_BOOK_ITEM } from 'graphql/queries'
import React from 'react'

const GetBlocks = (props) => {
  // props destructure
  const { component: Component, line } = props

  const variables = () => {
    const { dedupId, regex, lineCount, wordCount, colWidth } = line

    const text = Array.from({ length: lineCount }, () => ({
      words: Array.from({ length: wordCount }, (_word, wordIdx) => ({
        regex,
        dedupId: `${dedupId}-W${wordIdx}`,
      })),
    }))

    // the point of this logic is to pass unique args per word
    // based on the knowledge (or assumption?) that this will prevent caching
    // and getting duplicates... we need to reassess this.

    // new text arg
    /*
      text: {
        lineCount,
        regex
      }

    */

    return {
      ...line,
      colWidth: colWidth - 5,
      text,
    }
  }
  // console.log('GET_BOOK_ITEM: variables()', variables())

  const { loading, data, fetchMore } = useQuery(GET_BOOK_ITEM, {
    variables: variables(),
  })

  return (
    <Component
      {...props}
      isLoadingBookItem={loading}
      fetchMore={fetchMore}
      entry={data && data.bookItem && data.bookItem.entry}
      variables={variables()}
    />
  )
}
//

GetBlocks.defaultProps = {
  line: {},
  component: Block,
}
/*
GetBlocks.propTypes = {
  component: CustomPropTypes.component.isRequired,
  line: PropTypes.object.isRequired,
  style: PropTypes.object,
  update: PropTypes.object
};
*/
export default GetBlocks
