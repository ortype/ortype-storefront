import { useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import { BookContext } from 'components/data/BookProvider'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect } from 'react'
import Select, { components } from 'react-select'

const Arrow = () => (
  <svg width="32px" height="32px" viewBox="0 0 32 32">
    <g
      id="Elements"
      stroke="none"
      stroke-width="1"
      fill="none"
      fill-rule="evenodd"
    >
      <g id="Element-/-Arrow" fill="currentColor">
        <polygon
          id="Triangle"
          transform="translate(16.000000, 16.000000) rotate(-180.000000) translate(-16.000000, -16.000000) "
          points="16 12 22 20 10 20"
        ></polygon>
      </g>
    </g>
  </svg>
)

const colorPrimary = `#000000`
const colorSecondary = `#A3A3A3`
const baseSpacing = `.5rem`
const mediumSpacing = `1rem`
const largeSpacing = `2rem`

const StyledSelect = styled(Select)({
  margin: `0 0.5rem`,
  display: `block`,
  width: `16rem`,
})

const { DropdownIndicator } = components

const IndicatorIcon = styled(Arrow)(
  {
    pointerEvents: `none`,
    position: `absolute`,
    top: `calc(50% - 16px)`,
    right: `0.25rem`,
    transformOrigin: `center 16px`,
    transition: `transform 0.2s ease`,
  },
  (props) => (props.active ? { transform: `rotate(180deg)` } : {})
)

const CustomDropdownIndicator = ({ ...props }) => (
  <DropdownIndicator {...props}>
    <IndicatorIcon active={props.selectProps.menuIsOpen} />
  </DropdownIndicator>
)

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
        paddingTop: baseSpacing,
        paddingBottom: mediumSpacing,
        marginRight: `-0.1rem`,
        // display: `inline-flex`,
        display: `inline-block`,
      }
    },
    control(base, state) {
      let styles
      console.log('select control: ', state.selectProps)
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

const TieredSelect = observer(
  ({ fonts, handleLayoutChange, layoutOptions, layoutsLoading }) => {
    const bookLayoutStore = useContext(BookContext)

    console.log('layoutOptions: ', layoutsLoading, layoutOptions)

    const setVariantOptions = (fontItem) => {
      // set default variantOption (or first one)
      // this overrides anything in the store or localstorage
      // but without it, selecting new fonts doesn't update variant options
      if (fontItem?.variants) {
        const { _id: value, name: label } = fontItem.variants[0]
        bookLayoutStore.setVariantOption({ value, label })

        bookLayoutStore.setVariantOptions(
          fontItem &&
            fontItem.variants.map((variant) => ({
              label: variant.name,
              value: variant._id,
            }))
        )
        console.log(
          'bookLayoutStore.variantOptions: ',
          toJS(bookLayoutStore.variantOptions)
        )
      }
    }

    const handleFontFamilyChange = (option) => {
      console.log('handleFontFamilyChange: ', option)
      if (!option) return
      bookLayoutStore.setFontFamily(option)
      // update metrics
      const fontItem = fonts.find((item) => item._id === option.value)
      fontItem && bookLayoutStore.setMetrics(fontItem.metafields)

      // when the font family changes we need to call `setLayoutOption` with

      setVariantOptions(fontItem)
    }

    const handleVariantChange = (option) => {
      console.log('handleVariantChange: ', option)
      if (!option) return
      bookLayoutStore.setVariantOption(option)
    }

    // update data in mobx: font family options, variant options from catalog data (reactively)
    useEffect(() => {
      if (fonts) {
        // INITIAL FONT FAMILY OPTIONS
        bookLayoutStore.setFontFamilyOptions(
          fonts.map((item) => ({
            label: item.name,
            value: item._id,
          }))
        )
        console.log(
          'bookLayoutStore.fontFamilyOptions: ',
          toJS(bookLayoutStore.fontFamilyOptions)
        )

        // INITIAL VARIANT OPTIONS
        const fontItem = fonts.find(
          (item) => item._id === bookLayoutStore.fontFamily.value
        )
        setVariantOptions(fontItem, bookLayoutStore.fontFamily.value)
      }
    }, [fonts])

    // reactively update data in mobx when layoutOptions changes
    useEffect(() => {
      if (!layoutsLoading) {
        const firstItem =
          layoutOptions &&
          layoutOptions[0] &&
          layoutOptions[0].options &&
          layoutOptions[0].options[0]
        console.log(
          'layoutOptions/layoutsLoading useEffect... firstItem',
          firstItem
        )
        if (firstItem) {
          // this overrides anything in the store or localstorage
          // but without it, selecting new fonts doesn't update the selected layout
          bookLayoutStore.setLayoutOption(firstItem) // use 1st item as default
        }
        // ok this could be a problem...
        // bookLayoutStore.setIsTemplate(firstItem.isTemplate); // update isTemplate
      }
    }, [layoutsLoading])

    return (
      <React.Fragment>
        <Select
          placeholder="Select font"
          isReadOnly={false}
          isLoading={false}
          options={
            bookLayoutStore.fontFamilyOptions &&
            bookLayoutStore.fontFamilyOptions.constructor === Array
              ? toJS(bookLayoutStore.fontFamilyOptions)
              : []
          }
          value={bookLayoutStore.fontFamily}
          name="variant"
          onChange={handleFontFamilyChange}
          components={{
            IndicatorSeparator: null,
            DropdownIndicator: CustomDropdownIndicator,
          }}
          styles={getCustomStyles({ width: 256, maxWidth: 400 })}
        />
        <Select
          placeholder="Select style"
          isReadOnly={false}
          isLoading={false}
          options={
            bookLayoutStore.variantOptions &&
            bookLayoutStore.variantOptions.constructor === Array
              ? toJS(bookLayoutStore.variantOptions)
              : []
          }
          value={bookLayoutStore.variantOption}
          name="variant"
          onChange={handleVariantChange}
          components={{
            IndicatorSeparator: null,
            DropdownIndicator: CustomDropdownIndicator,
          }}
          styles={getCustomStyles({ width: 256, maxWidth: 400 })}
        />
        <Select
          placeholder="Select layout"
          isReadOnly={layoutsLoading}
          isLoading={layoutsLoading}
          options={layoutOptions}
          value={bookLayoutStore.layoutOption}
          name="layouts"
          onChange={handleLayoutChange}
          components={{
            IndicatorSeparator: null,
            DropdownIndicator: CustomDropdownIndicator,
          }}
          styles={getCustomStyles({ width: 256, maxWidth: 400 })}
        />
      </React.Fragment>
    )
  }
)

export default TieredSelect
