import { Button, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import NumericInput from 'components/composite/Book/NumericInput'
import { BookContext } from 'components/data/BookProvider'
import { observer } from 'mobx-react-lite'
import React, { useContext, useState } from 'react'
import { ArrowContainer, Popover } from 'react-tiny-popover'

const PopoverWrapper = styled(`div`)({
  // position: `relative`,
  // height: `100%`,
})

const PopoverInner = styled(`div`)({
  border: `.1rem solid #000`,
  boxShadow: `2px 2px 0px #000`,
  padding: `0.75rem`,
  backgroundColor: `#fff`,
  width: `16rem`,
})

const PopoverToggle = styled(`div`)({
  // display: `inline-flex`,
  // alignItems: `center`,
  cursor: `pointer`,
  position: `absolute`,
  left: `-0.75rem`,
})

const PopoverToggleIcon = styled(`div`)({
  //   content: `${'\2807'}`,
  // fontSize: `100px`,
  width: `5px`,
  height: `5px`,
  borderRadius: `50%`,
  backgroundColor: `#000`,
  marginBottom: `20px`,
  marginRight: `.5rem`,
  boxShadow: `0px 8px 0px black, 0px 16px 0px black`,
})

const ColumnPopover = observer(({ width, blocks, update, ...props }) => {
  const { page, col } = update
  const bookLayoutStore = useContext(BookContext)

  // Popover
  const [isPopoverOpen, setPopover] = useState(false)
  const openPopover = () => setPopover(true)
  const closePopover = () => setPopover(false)

  const handleChange = (key, value) => {
    if (bookLayoutStore.updateColumn && col[key] !== value) {
      bookLayoutStore.updateColumn(key, value, page, col)
    }
  }

  return (
    <PopoverWrapper>
      <Popover
        containerStyle={
          {
            // zIndex: 9999,
            // overflow: `visible`,
            // paddingRight: `2px`,
          }
        }
        position={[`bottom`, `left`]}
        isOpen={isPopoverOpen}
        onClickOutside={closePopover}
        content={({ position, childRect, targetRect, popoverRect }) => (
          <ArrowContainer
            position={position}
            childRect={childRect}
            targetRect={targetRect}
            popoverRect={popoverRect}
            arrowColor={`#000`}
            arrowSize={16}
          >
            <PopoverInner>
              <Text fontSize={'md'}>Edit Column</Text>
              <Text fontSize={'md'}>Width</Text>
              <NumericInput
                onChange={(value) => handleChange('width', value)}
                value={width}
                step={1}
                min={20}
                max={100}
                style={{
                  wrap: {
                    display: `block`,
                    marginBottom: `0.5rem`,
                  },
                  input: {
                    fontSize: `24px`,
                    width: `100%`,
                  },
                }}
              />
              <br />
              <Button
                actionType="secondary"
                isFullWidth
                onClick={() =>
                  bookLayoutStore.addColumn(page, 20, 'before', col)
                }
              >
                <Text fontSize={'sm'}>Add column before</Text>
              </Button>
              <br />
              <Button
                actionType="secondary"
                isFullWidth
                onClick={() =>
                  bookLayoutStore.addColumn(page, 20, 'after', col)
                }
              >
                <Text fontSize={'sm'}>Add column after</Text>
              </Button>
              <br />
              <Button
                actionType="secondary"
                isFullWidth
                onClick={() => bookLayoutStore.removeColumn(page, col)}
              >
                <Text fontSize={'sm'}>Delete this column</Text>
              </Button>
              <br />
              <Button
                actionType="secondary"
                isFullWidth
                onClick={() => bookLayoutStore.uppercaseAll(page, col)}
              >
                <Text fontSize={'sm'}>Uppercase all</Text>
              </Button>
              <br />
            </PopoverInner>
          </ArrowContainer>
        )}
      >
        <PopoverToggle onClick={openPopover}>
          <PopoverToggleIcon />
        </PopoverToggle>
      </Popover>
      {props.children}
    </PopoverWrapper>
  )
})

/*
ColumnPopover.propTypes = {
  blocks: PropTypes.array,
  update: PropTypes.object,
  width: PropTypes.number
};
*/
export default ColumnPopover
