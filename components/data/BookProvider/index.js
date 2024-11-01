'use client'
import { useQuery } from '@apollo/client'
import {
  defaultBlock,
  defaultColumn,
  uuid,
} from 'components/data/BookProvider/bookDefaults'
import { GET_BOOK_LAYOUT } from 'graphql/queries'
import cloneDeep from 'lodash.clonedeep'
import { action, autorun, reaction, toJS } from 'mobx'
import { useLocalObservable } from 'mobx-react-lite'
import { notFound } from 'next/navigation'
import React, { createContext, useContext, useEffect } from 'react'

// @TODO: Typescript this mobx store

export const BookLayoutProvider = ({ data, children }) => {
  const { fonts = [], font = { variants: [] }, initialBookLayout = {} } = data

  if (!data) {
    notFound()
  }

  const getMetric = (key) => {
    return Number(store.metafields.find((field) => field.key === key)?.value)
  }

  const store = useLocalObservable(() => ({
    /* observables here */
    isDirty: false,
    editMode: true,
    regex: 'capitalize',
    layoutOption: {
      label: initialBookLayout.name,
      value: initialBookLayout._id,
    },
    bookLayoutData: {},
    isTemplate: initialBookLayout.isTemplate,
    fontFamily: {
      label: font.name,
      value: font._id,
    },
    fontFamilyOptions: fonts.map((item) => ({
      label: item.name,
      value: item._id,
    })),
    variantOption: {
      label: font.variants[0].name,
      value: font.variants[0]._id,
    },
    variantOptions: font.variants.map((variant) => ({
      label: variant.optionName,
      value: variant._id,
    })),
    metafields: font.metafields,
    spread: {
      verso: initialBookLayout.spread?.verso,
      recto: initialBookLayout.spread?.recto,
    },
    /* getters */
    get metrics() {
      let metrics = {}
      if (store.metafields) {
        const unitsPerEm = getMetric('unitsPerEm')
        const capHeight = getMetric('capHeight') / unitsPerEm
        const lineGap = getMetric('hheaLineGap') / unitsPerEm
        // usWinAscent, sTypoAscender, hheaAscender
        const ascent = getMetric('usWinAscent') / unitsPerEm
        // usWinDescent, sTypoDescender, hheaDescender
        const descent = getMetric('usWinDescent') / unitsPerEm
        // const lineHeightNormal = ascent + descent + lineGap
        const contentArea = ascent + descent // + lineGap
        const distanceTop = ascent - capHeight
        // --fm-capitalHeight: 0.68;
        // --fm-descender: 0.54;
        // --fm-ascender: 1.1;
        // --fm-capitalHeight: 0.68; (example)
        // these do not apply I think, we don't need to size the font by cap height, do we?
        //  --capital-height: 100; (target font size)
        // --computedFontSize: (var(--capital-height) / var(--fm-capitalHeight));

        metrics = {
          unitsPerEm,
          contentArea,
          lineGap,
          capHeight,
          ascent,
          descent,
          distanceTop,
        }
      }
      return metrics
    },
    /* actions */
    setBookLayoutData: action((value) => {
      store.bookLayoutData = value
    }),
    setMetafields: action((value) => {
      store.metafields = value
    }),
    setIsDirty: action((value) => {
      store.isDirty = value
    }),
    setIsTemplate: action((value) => {
      // @TEMP: interpert `null` values as `false`
      store.isTemplate = value === null ? false : value
    }),
    setLayoutOption: action((option) => {
      store.layoutOption = option
    }),
    setEditMode: action((value) => {
      store.editMode = value
    }),
    setFontFamily: action((option) => {
      store.fontFamily = option
    }),
    setFontFamilyOptions: action((options) => {
      store.fontFamilyOptions = options
    }),
    setVariantOption: action((option) => {
      store.variantOption = option
    }),
    setVariantOptions: action((options) => {
      store.variantOptions = options
    }),
    setMetrics: action((metafields) => {
      store.metafields = metafields
    }),
    setSpread: action((spread) => {
      // For legacy layouts that didn't have IDs or default values
      // assign every column and block an uuid

      // TypeError: Cannot assign to read only property 'colId' of object '#<Object>'
      // With apollo-client v3 the cache is immutable
      // https://github.com/apollographql/apollo-client/issues/5903
      // https://www.apollographql.com/blog/announcement/frontend/whats-new-in-apollo-client-2-6/
      // const newSpread = { ...spread }; didn't work, but cloneDeep does
      // https://github.com/apollographql/apollo-client/issues/5903#issuecomment-732904527
      const newSpread = cloneDeep(spread)
      newSpread?.recto.forEach((col) => {
        col.colId = col.colId || `col_${uuid()}`
        col.blocks.forEach((block) => {
          block.blockId = block.blockId || `block_${uuid()}`
          block.regex = block.regex || `capitalize`
          block.noSpace = block.noSpace || true
          block.isParagraph = block.isParagraph || false
          block.marginBottom = block.marginBottom || 0
          block.lineGap = block.lineGap || 0
        })
      })

      newSpread?.verso.forEach((col) => {
        col.colId = col.colId || `col_${uuid()}`
        col.blocks.forEach((block) => {
          block.blockId = block.blockId || `block_${uuid()}`
          block.regex = block.regex || `capitalize`
          block.noSpace = block.noSpace || true
          block.isParagraph = block.isParagraph || false
          block.marginBottom = block.marginBottom || 0
          block.lineGap = block.lineGap || 0
        })
      })
      store.spread = newSpread
    }),
    updateBlock: action((key, value, page, col, block) => {
      // eslint-disable-next-line no-console
      // console.log('Store: updateBlock: ', key, value, page, col, block)
      if (
        // this conditional is needed in some cases when deleting layouts
        store.spread[page] &&
        store.spread[page][col] &&
        store.spread[page][col].blocks[block]
      ) {
        store.spread[page][col].blocks[block][key] = value
      } else {
        // eslint-disable-next-line no-console
        console.log(
          'store.spread is missing a block or something... ',
          store.spread
        )
      }
    }),
    removeBlock: action((page, col, block) => {
      store.spread[page][col].blocks = store.spread[page][col].blocks.filter(
        (value, index) => index !== block
      )
    }),
    addBlock: action((page, col, location = 'after', index = 0) => {
      switch (location) {
        case 'before':
          store.spread[page][col].blocks.splice(index, 0, defaultBlock())
          break
        default:
          store.spread[page][col].blocks.push(defaultBlock())
          break
      }
    }),
    addColumn: action((page, width, location = 'end', index = 0) => {
      // console.log('addColumn: ', page, width, location, index)
      switch (location) {
        case 'before':
          store.spread[page].splice(index, 0, defaultColumn())
          break
        case 'after':
          store.spread[page].splice(index + 1, 0, defaultColumn())
          break
        default:
          store.spread[page].push({ width, blocks: [defaultBlock()] })
      }
    }),
    duplicateColumn: action((page, width, blocks, index = 0) => {
      // console.log('duplicateColumn: ', page, width, blocks, index)
      // colId: 'col_xg4qvh7wi', width: 100, blocks: Array(6)
      store.spread[page].splice(index + 1, 0, {
        colId: `col_${uuid()}`,
        width,
        blocks: blocks.map((block) => ({
          ...block,
          blockId: `block_${uuid()}`,
        })),
      })
    }),
    removeColumn: action((page, col) => {
      store.spread[page] = store.spread[page].filter(
        (value, index) => index !== col
      )
    }),
    updateColumn: action((key, value, page, col) => {
      store.spread[page][col][key] = value
    }),
    uppercaseAll: action((page, col) => {
      store.spread[page][col].blocks = store.spread[page][col].blocks.map(
        (item) => {
          item.regex = 'uppercase'
          return item
        }
      )
    }),
    swapPages: action((spread) => {
      const newSpread = cloneDeep(toJS(spread))
      store.spread.recto = newSpread.verso
      store.spread.verso = newSpread.recto
    }),
    duplicatePage: action((source, target) => {
      store.spread[target] = store.spread[source]
      store.spread[target].forEach((col) => {
        col.colId = col.colId || `col_${uuid()}`
        col.blocks.forEach((block) => {
          block.blockId = block.blockId || `block_${uuid()}`
        })
      })
    }),
    filterAll: action((spread, regex) => {
      const newSpread = cloneDeep(toJS(spread))
      // console.log('filterAll: ', newSpread)
      newSpread.recto.forEach((col) => {
        col.blocks.forEach((block) => {
          block.regex = regex
        })
      })

      newSpread.verso.forEach((col) => {
        col.blocks.forEach((block) => {
          block.regex = regex
        })
      })
      store.regex = regex
      store.spread = newSpread
    }),
  }))

  useEffect(() => {
    // update store on `font` prop change
    store.setVariantOption({
      label: font.variants[0].optionName,
      value: font.variants[0]._id,
    })
    store.setVariantOptions(
      font.variants.map((variant) => ({
        label: variant.optionName,
        value: variant._id,
      }))
    )
    store.setMetafields(font.metafields)

    // set isDirty flag by comparing store against previous data from DB
    return autorun(
      () => {
        console.log('AUTORUN... running')
        if (
          store.bookLayoutData &&
          store.bookLayoutData.isTemplate !== null &&
          store.spread !== null
        ) {
          const storeSpread = JSON.stringify(toJS(store.spread))
          const dbSpread = JSON.stringify(store.bookLayoutData.spread)
          if (
            store.bookLayoutData.isTemplate !== store.isTemplate ||
            storeSpread !== dbSpread
          ) {
            store.setIsDirty(true)
            console.log('IS DIRTY!')
          } else {
            store.setIsDirty(false)
            console.log('NOT DIRTY!')
          }
        }
      },
      { delay: 500 }
    )
  }, [font])

  return <BookContext.Provider value={store}>{children}</BookContext.Provider>
}

export const BookContext = createContext()
export const useBookLayoutStore = () => useContext(BookContext)
