import {
  defaultBlock,
  defaultColumn,
  uuid,
} from 'components/data/BookProvider/bookDefaults'
import cloneDeep from 'lodash.clonedeep'
import { action } from 'mobx'
import { useLocalObservable } from 'mobx-react-lite'
import React, { createContext, useContext } from 'react'

export const BookLayoutProvider = ({ children }) => {
  const store = useLocalObservable(() => ({
    /* observables here */
    layoutOption: {
      label: 'Simple layout 1',
      value: 'jZQowagN9HqSh3udy',
    },
    isTemplate: false,
    fontFamily: {
      label: 'Boogie School Sans',
      value: 'font-jKmDARQpXFW60yeRco5AJ',
    },
    variantOption: {
      label: 'High 2nd',
      value: 'fontVariant-8UZWNzaqW4Ya4tyzovmZU',
    },
    fontFamilyOptions: [],
    variantOptions: [],
    metafields: [
      {
        key: 'otf',
        value: 'BoogieSchoolSans-High2nd.otf',
      },
      {
        key: 'woff',
        value: 'BoogieSchoolSans-High2nd.woff',
      },
      {
        key: 'woff2',
        value: 'BoogieSchoolSans-High2nd.woff2',
      },
      {
        key: 'descent',
        value: '234',
      },
      {
        key: 'ascent',
        value: '966',
      },
      {
        key: 'capHeight',
        value: '702',
      },
    ],
    editMode: true,
    spread: {
      verso: [],
      recto: [],
    },
    /* getters */
    get metrics() {
      let metrics = {}
      if (store.metafields) {
        const ascent = store.metafields.find((field) => field.key === 'ascent')
        const descent = store.metafields.find(
          (field) => field.key === 'descent'
        )
        const capHeight = store.metafields.find(
          (field) => field.key === 'capHeight'
        )
        metrics = {
          contentArea: (Number(ascent.value) + Number(descent.value)) / 1000,
          distanceTop: (Number(ascent.value) - Number(capHeight.value)) / 1000,
        }
      }
      return metrics
    },
    /* actions */
    setIsTemplate: action((value) => {
      console.log('action setIsTemplate', value)
      store.isTemplate = value
    }),
    setLayoutOption: action((option) => {
      store.layoutOption = option
      store.isTemplate = option.isTemplate
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
      newSpread.recto.forEach((col) => {
        col.colId = col.colId || `col_${uuid()}`
        col.blocks.forEach((block) => {
          block.blockId = block.blockId || `block_${uuid()}`
          block.regex = block.regex || `all`
          block.noSpace = block.noSpace || false
          block.noGibberish = block.noGibberish || false
          block.isParagraph = block.isParagraph || false
        })
      })

      newSpread.verso.forEach((col) => {
        col.colId = col.colId || `col_${uuid()}`
        col.blocks.forEach((block) => {
          block.blockId = block.blockId || `block_${uuid()}`
          block.regex = block.regex || `all`
          block.noSpace = block.noSpace || false
          block.noGibberish = block.noGibberish || false
          block.isParagraph = block.isParagraph || false
        })
      })

      store.spread = newSpread
    }),
    updateBlock: action((key, value, page, col, block) => {
      // eslint-disable-next-line no-console
      console.log('Store: updateBlock: ', key, value, page, col, block)
      store.spread[page][col].blocks[block][key] = value
    }),
    removeBlock: action((page, col, block) => {
      store.spread[page][col].blocks = store.spread[page][col].blocks.filter(
        (value, index) => index !== block
      )
    }),
    addBlock: action((page, col) => {
      store.spread[page][col].blocks.push(defaultBlock())
    }),
    addColumn: action((page, width, location = 'end', index = 0) => {
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
  }))
  return <BookContext.Provider value={store}>{children}</BookContext.Provider>
}

export const BookContext = createContext()
export const useBookLayoutStore = () => useContext(BookContext)
