import { Box, Container, Flex } from '@chakra-ui/react'
import { css, jsx } from '@emotion/react'
import styled from '@emotion/styled'
import BlockPopover from 'components/composite/Book/BlockPopover'
import { BookContext } from 'components/data/BookProvider'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useState } from 'react'

const Guides = styled(`div`)(
  {
    display: `block`,
    marginTop: `1.5rem`, // `32.4px`, // `1.5rem`,
    marginTop: `32.4px`,
    transition: `none`,
    position: `relative`,
  },
  ({ colWidth, innerWrapperStyle, editMode }) => ({
    width: `${colWidth}px`,
    ...innerWrapperStyle,
    [`&:hover`]: {
      backgroundColor: editMode && `#F8FFBF82`,
    },
  })
)

const Loading = styled(Guides)({
  fontSize: `16px`,
  fontFamily: `Alltaf-Regular`,
})

const BlockPoints = styled(`span`)({
  fontSize: `12px`,
  zIndex: 99,
  position: `absolute`,
  // bottom: `100%`, // here the line height plays a role
  // transform: `translateY(30%)`
  top: `2px`,
})

const Block = observer((props) => {
  const { entry, line, isLoadingBookItem, layout } = props
  const bookLayoutStore = useContext(BookContext)
  const [word, setWord] = useState(entry)
  useEffect(() => {
    setWord(entry)
  }, [isLoadingBookItem, entry])

  if (bookLayoutStore.editMode) {
    return (
      <Flex
        position={'relative'}
        mb={'10.8px'}
        mt={layout.outerWrapperMarginTop}
      >
        <BlockPopover {...props} setWord={setWord} fetchMore={props.fetchMore}>
          <BlockPoints>{`${line.fontSize} points`}</BlockPoints>
          {isLoadingBookItem ? (
            <Loading
              colWidth={line.colWidth}
              innerWrapperStyle={layout.innerWrapperStyle}
            >{`Loading...`}</Loading>
          ) : (
            <Guides
              className={bookLayoutStore.variantOption.value}
              editMode={bookLayoutStore.editMode}
              colWidth={line.colWidth}
              innerWrapperStyle={layout.innerWrapperStyle}
            >
              <div
                css={{
                  position: 'absolute',
                  top: `${layout.offsetValue}`,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <Box
                  as={'span'}
                  // whiteSpace={line.lineCount === 1 ? 'nowrap' : 'pre-wrap'}
                  whiteSpace={'pre-wrap'}
                >
                  {word}
                </Box>
              </div>
            </Guides>
          )}
        </BlockPopover>
      </Flex>
    )
  }

  return (
    <Flex position={'relative'} mb={'10.8px'} mt={layout.outerWrapperMarginTop}>
      <BlockPoints>{`${line.fontSize} points`}</BlockPoints>
      <Guides
        className={bookLayoutStore.variantOption.value}
        editMode={bookLayoutStore.editMode}
        colWidth={line.colWidth}
        innerWrapperStyle={layout.innerWrapperStyle}
      >
        <div
          css={{
            position: 'absolute',
            top: `${layout.offsetValue}`,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Box
            as={'span'}
            // whiteSpace={line.lineCount === 1 ? 'nowrap' : 'pre-wrap'}
            whiteSpace={'pre-wrap'}
          >
            {word}
          </Box>
        </div>
      </Guides>
    </Flex>
  )
})
/*
Block.propTypes = {
  entry: PropTypes.string,
  isLoadingBookItem: PropTypes.bool,
  line: PropTypes.object,
}
*/
export default Block
