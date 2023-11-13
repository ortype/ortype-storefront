import { useQuery } from '@apollo/client'
import { useBookLayoutStore } from 'components/data/BookProvider'
import StyledSelect from 'components/ui/Select'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'

const TieredSelect = observer(
  ({ fonts, handleLayoutChange, layoutOptions, layoutsLoading }) => {
    const bookLayoutStore = useBookLayoutStore()

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
              label: variant.optionName,
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
      // OK, so the metrics are pulled from the family not the variant

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
        const storedJson = localStorage.getItem('bookLayoutStore_layoutOption')
        if (!storedJson && firstItem) {
          // this overrides anything in the store or localstorage
          // but without it, selecting new fonts doesn't update the selected layout
          bookLayoutStore.setLayoutOption(firstItem) // use 1st item as default
        }
        // ok this could be a problem...
        // bookLayoutStore.setIsTemplate(firstItem.isTemplate); // update isTemplate
      }
    }, [layoutsLoading])

    return (
      <>
        <StyledSelect
          placeholder="Select font"
          options={
            bookLayoutStore.fontFamilyOptions &&
            bookLayoutStore.fontFamilyOptions.constructor === Array
              ? toJS(bookLayoutStore.fontFamilyOptions)
              : []
          }
          value={bookLayoutStore.fontFamily}
          name="font"
          onChange={handleFontFamilyChange}
        />

        <StyledSelect
          placeholder="Select style"
          options={
            bookLayoutStore.variantOptions &&
            bookLayoutStore.variantOptions.constructor === Array
              ? toJS(bookLayoutStore.variantOptions)
              : []
          }
          value={bookLayoutStore.variantOption}
          name="variant"
          onChange={handleVariantChange}
        />
        <StyledSelect
          placeholder="Select layout"
          isReadOnly={layoutsLoading}
          isLoading={layoutsLoading}
          options={layoutOptions}
          value={bookLayoutStore.layoutOption} // @TODO: re-render this value when NameInput submits
          name="layouts"
          onChange={handleLayoutChange}
        />
      </>
    )
  }
)

export default TieredSelect
