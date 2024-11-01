import { Box, Indicator, Spinner } from '@chakra-ui/react'
import Select, { components, DropdownIndicatorProps } from 'react-select'

const Arrow = (props) => (
  <Box {...props} as={'svg'} width="32px" height="32px" viewBox="0 0 32 32">
    <g
      id="Elements"
      stroke="none"
      strokeWidth="1"
      fill="none"
      fillRule="evenodd"
    >
      <g id="Element-/-Arrow" fill="currentColor">
        <polygon
          id="Triangle"
          transform="translate(16.000000, 16.000000) rotate(-180.000000) translate(-16.000000, -16.000000) "
          points="16 12 22 20 10 20"
        ></polygon>
      </g>
    </g>
  </Box>
)

const colorPrimary = `#000000`
const colorSecondary = `#A3A3A3`
const baseSpacing = `.5rem`
const mediumSpacing = `1rem`
const largeSpacing = `2rem`

const LoadingIndicator = (props) => {
  return <Spinner size={'sm'} mr={8} />
}

// const IndicatorSeparator

const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <components.DropdownIndicator {...props}>
      <Arrow
        sx={{
          pointerEvents: `none`,
          // position: `absolute`,
          // top: `calc(50% - 16px)`,
          // right: `0.25rem`,
          transformOrigin: `center 16px`,
          transition: `transform 0.2s ease`,
        }}
        transform={props.selectProps.menuIsOpen && `rotate(180deg)`}
      />
    </components.DropdownIndicator>
  )
}
/*
const CustomDropdownIndicator = ({ ...props }) => (
  <DropdownIndicator {...props}>
    <Arrow
      sx={{
        pointerEvents: `none`,
        position: `absolute`,
        top: `calc(50% - 16px)`,
        right: `0.25rem`,
        transformOrigin: `center 16px`,
        transition: `transform 0.2s ease`,
      }}
      transform={props.selectProps.menuIsOpen && `rotate(180deg)`}
    />
  </DropdownIndicator>
)*/

/**
 * @summary Returns custom Select styles
 * @param {Object} props The component props object
 * @returns {Object} The style object
 */
function getCustomStyles({ width, maxWidth }) {
  return {
    container(base) {
      return {
        ...base,
        width,
        maxWidth,
        paddingTop: '0.25rem',
        paddingBottom: baseSpacing,
        marginRight: `-0.1rem`,
      }
    },
    control(base, state) {
      let styles
      // console.log('select control: ', state.selectProps)
      if (state.selectProps.menuIsOpen) {
        styles = {
          transform: `translateX(-0.5rem) translateY(-0.25rem)`,
          boxShadow: `2px 2px 0px ${colorPrimary}`,
          borderColor: `${colorPrimary}`,
          paddingLeft: `0.5rem`,
          borderTopWidth: `.1rem`,
          borderLeftWidth: `.1rem`,
          borderRightWidth: `.1rem`,
          borderTopColor: `${colorPrimary}`,
          [`:hover`]: {
            borderColor: `${colorPrimary}`,
          },
        }
      }

      return {
        ...base,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: `.1rem`,
        borderTopColor: `transparent`,
        borderBottomWidth: `.1rem`,
        borderStyle: `solid`,
        borderColor: `${colorPrimary}`,
        borderRadius: 0,
        // borderBottomColor: `${colorPrimary}`,
        cursor: `pointer`,
        // boxShadow: `0 0.2rem 0 -0.1rem #000`,
        boxShadow: `none`,
        position: `relative`,
        minHeight: `3rem`,
        '> div': {
          overflow: `initial`,
          padding: 0,
        },
        '> *div': {
          marginLeft: 0,
          marginRight: 0,
        },
        ':hover': {
          borderTopWidth: `.1rem`,
          borderLeftWidth: `.1rem`,
          borderRightWidth: `.1rem`,
          borderColor: `${colorPrimary}`,
          boxShadow: `2px 2px 0px ${colorPrimary}`,
          transform: `translateX(-0.5rem) translateY(-0.25rem)`,
          paddingLeft: `0.5rem`,
        },
        ...styles,
      }
    },
    singleValue(base) {
      return {
        ...base,
        overflow: `initial`,
        padding: 0,
        margin: 0,
        lineHeight: `3rem`,
      }
    },
    input(base) {
      return {
        ...base,
        margin: 0,
      }
    },
    placeholder(base, state) {
      let top
      if (state.hasValue || state.selectProps.inputValue) {
        top = `-0.6rem`
      } else {
        top = `50%`
      }

      return {
        ...base,
        padding: 0,
        margin: 0,
        lineHeight: `1rem`,
        backgroundColor:
          (state.hasValue || state.selectProps.inputValue) && `#fff`,
        color: colorSecondary,
        display: `flex`,
        alignItems: `center`,
        position: `absolute`,
        transition: `top 0.2s ease, font-size 0.2s ease`,
        fontSize:
          state.hasValue || state.selectProps.inputValue ? `1rem` : `1.4375rem`,
        top,
      }
    },

    option(base, state) {
      return {
        ...base,
        cursor: 'pointer',
        // backgroundColor: `initial`,
        padding: `0 0.5rem`,
        lineHeight: `3rem`,
        color: state.isSelected ? `#FFF` : colorPrimary,
        backgroundColor: state.isSelected ? colorPrimary : `#FFF`,
        borderTop: `0.1rem solid transparent`,
        borderBottom: `0.1rem solid transparent`,
        // the :focus pseudo class doesn't work with keyboard navigation, similar to this issue https://stackoverflow.com/questions/53913136/why-arrow-key-navigation-doesnt-work-or-focus-in-dropdown-in-react-select-whe
        // so we work around with state.isFocused
        borderColor: state.isFocused ? colorPrimary : `transparent`,
        ':hover': {
          borderTop: `0.1rem solid ${colorPrimary}`,
          borderBottom: `0.1rem solid ${colorPrimary}`,
        },
        ':active': {
          color: `#FFF`,
          backgroundColor: colorPrimary,
        },
      }
    },
    dropdownIndicator(base, state) {
      return {
        ...base,
        padding: 0,
        color: colorPrimary,
        ':hover': {
          color: colorPrimary,
        },
      }
    },
    menuList(base) {
      return {
        ...base,
        padding: 0,
        border: `.1rem solid ${colorPrimary}`,
        display: `flex`,
        flexDirection: `column`,
      }
    },
    menu(base, state) {
      let styles
      if (state.selectProps.menuIsOpen) {
        styles = {
          transform: `translateX(-0.5rem) translateY(-0.35rem)`,
          boxShadow: `2px 2px 0px ${colorPrimary}`,
        }
      }
      return {
        ...base,
        top: `3.5rem`,
        //marginTop: `-0.1rem`,
        boxShadow: 'none',
        borderRadius: 0,
        ...styles,
      }
    },
  }
}

// const StyledSelect = ({ placeholder, options, value, name, onChange }) => {
const StyledSelect = ({ width, maxWidth, isReadOnly, isLoading, ...props }) => {
  return (
    <Select
      components={{
        IndicatorSeparator: props.isClearable
          ? components.IndicatorSeparator
          : null,
        DropdownIndicator,
        LoadingIndicator,
      }}
      styles={getCustomStyles({
        width: width || 300,
        maxWidth: maxWidth || 400,
      })}
      isReadOnly={isReadOnly || false}
      isLoading={isLoading || false}
      {...props}
    />
  )
}

export default StyledSelect
