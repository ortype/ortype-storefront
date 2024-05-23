'use client'

import useDimensions from '@/components/hooks/useDimensions'
import { useQuery } from '@apollo/client'
import { Box, Center, Flex } from '@chakra-ui/react'
import Column from 'components/composite/Book/Column'
import Toolbar from 'components/composite/Book/Toolbar'
import { useBookLayoutStore } from 'components/data/BookProvider'
import { makeLocalStorage } from 'components/utils/makeLocalStorage'
import { GET_BOOK_LAYOUT } from 'graphql/queries'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useRef } from 'react'

export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value)
}

function isObject(value: any): value is Record<string, any> {
  const type = typeof value
  return (
    value != null &&
    (type === 'object' || type === 'function') &&
    !isArray(value)
  )
}
export function mapResponsive(prop: any, mapper: (val: any) => any) {
  if (Array.isArray(prop)) {
    return prop.map((item) => (item === null ? null : mapper(item)))
  }

  if (isObject(prop)) {
    return Object.keys(prop).reduce((result: Record<string, any>, key) => {
      result[key] = mapper(prop[key])
      return result
    }, {})
  }

  if (prop != null) {
    return mapper(prop)
  }

  return null
}

const BookPage = ({
  data: { fonts = [], font = {}, initialBookLayout = {} },
}) => {
  // const firstUpdate = useRef(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const bookLayoutStore = useBookLayoutStore()
  /*
  console.log(
    'bookLayoutStore: ',
    toJS(bookLayoutStore.fontFamily.label),
    toJS(bookLayoutStore.fontFamily.value),
    toJS(bookLayoutStore.layoutOption.label),
    'layoutId param: ',
    searchParams.get('id')
  )
*/
  const { loading, data, refetch } = useQuery(GET_BOOK_LAYOUT, {
    variables: {
      _id: searchParams.get('id') || bookLayoutStore.layoutOption.value,
    },
  })

  // store data in mobx
  useEffect(() => {
    if (loading === false && data && data.bookLayout) {
      /*
      console.log(
        'loading/data dep setLayoutOption: bookLayout',
        data.bookLayout
      )
      */
      bookLayoutStore.setLayoutOption({
        value: data.bookLayout._id,
        label: data.bookLayout.name,
      })
      bookLayoutStore.setSpread(data.bookLayout.spread)
      bookLayoutStore.setIsTemplate(data.bookLayout.isTemplate)
      bookLayoutStore.setBookLayoutData(data.bookLayout)

      // save to local storage
      return makeLocalStorage(
        bookLayoutStore,
        `${bookLayoutStore.fontFamily.value}_${data.bookLayout._id}_store`,
        [
          { name: 'isTemplate', action: 'setIsTemplate' },
          { name: 'editMode', action: 'setEditMode' },
          { name: 'regex', action: 'setRegex' },
          { name: 'spread', action: 'setSpread' },
        ]
      )
    }
  }, [font, loading, data])

  const targetRef = useRef()
  const size = useDimensions(targetRef)

  // when font family changes, reset currently selected layout to the initial layout
  // @TODO: this  is currently causing an issue where book layout is always reset
  // we need to look into the firstUpdate useRef(true) pattern
  /*
  useEffect(() => {
    if (!firstUpdate.current) {
      router.replace(`${pathname}/?id=${initialBookLayout._id}`, {
        scroll: false,
      })
    } else {
      firstUpdate.current = false
    }
  }, [font])
  */

  const pageWidth = 680
  const pageHeight = 930
  const pageMargin = 46
  const ratio = pageWidth / pageHeight
  const conversion = size.width / pageWidth

  // console.log('page conversion: ', pageWidth, pageHeight, ratio, conversion)

  return (
    <Suspense fallback={<div />}>
      <Box bg={'#000'} height={'100%'}>
        <Toolbar font={font} fonts={fonts} bookLayoutData={data} />
        <Flex
          // Spread
          id={bookLayoutStore.layoutOption.value}
          w={'85vw'}
          mx={'auto'}
          py={'10vh'}
        >
          <Box
            ref={targetRef}
            // maxW={'calc(100vw - 30rem)'}
            flex={'0 0 50%'}
            position="relative"
            // the before creates the height
            _before={{
              height: 0,
              content: `""`,
              display: 'block',
              paddingBottom: mapResponsive(ratio, (r) => `${(1 / r) * 100}%`),
            }}
          >
            <Flex
              // Verso
              w={'100%'}
              h={'100%'}
              bg={'#FFF'}
              position={'absolute'}
              top={0}
              left={0}
              bottom={0}
              right={0}
              flexWrap={'wrap'}
              alignContent={'flex-start'}
              _before={{
                content: bookLayoutStore.editMode ? `'Verso'` : `''`,
                color: '#FFF',
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                bottom: -pageMargin + 'px',
                fontSize: '12px',
              }}
              _after={{
                content: '""',
                display: bookLayoutStore.editMode ? 'block' : 'none',
                position: 'absolute',
                height: '1px',
                background: 'red',
                width: '100%',
                bottom: pageMargin + 'px',
              }}
              style={{
                padding: `${pageMargin * conversion}px`,
              }}
            >
              {bookLayoutStore.spread.verso?.map((col, idx) => (
                <Column
                  key={col.colId}
                  {...col}
                  conversion={conversion}
                  update={{ page: 'verso', col: idx }}
                />
              ))}
            </Flex>
          </Box>
          <Box
            flex={'0 0 50%'}
            position="relative"
            _before={{
              height: 0,
              content: `""`,
              display: 'block',
              paddingBottom: mapResponsive(ratio, (r) => `${(1 / r) * 100}%`),
            }}
          >
            <Flex
              // Recto
              w={'100%'}
              h={'100%'}
              bg={'#FFF'}
              position={'absolute'}
              top={0}
              left={0}
              bottom={0}
              right={0}
              flexWrap={'wrap'}
              alignContent={'flex-start'}
              _before={{
                content: bookLayoutStore.editMode ? `'Verso'` : `''`,
                color: '#FFF',
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                bottom: -pageMargin + 'px',
                fontSize: '12px',
              }}
              _after={{
                content: '""',
                display: bookLayoutStore.editMode ? 'block' : 'none',
                position: 'absolute',
                height: '1px',
                background: 'red',
                width: '100%',
                bottom: pageMargin + 'px',
              }}
              style={{
                padding: `${pageMargin * conversion}px`,
              }}
            >
              {bookLayoutStore.spread.recto?.map((col, idx) => (
                <Column
                  key={col.colId}
                  {...col}
                  conversion={conversion}
                  update={{ page: 'recto', col: idx }}
                />
              ))}
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Suspense>
  )
}

export default observer(BookPage)
