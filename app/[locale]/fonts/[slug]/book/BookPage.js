'use client'
import { AuthorizerProvider } from '@authorizerdev/authorizer-react'

import { useQuery } from '@apollo/client'
import { Center, Flex } from '@chakra-ui/react'
import Column from 'components/composite/Book/Column'
import Toolbar from 'components/composite/Book/Toolbar'
import { useBookLayoutStore } from 'components/data/BookProvider'
import { makeLocalStorage } from 'components/utils/makeLocalStorage'
import { GET_BOOK_LAYOUT } from 'graphql/queries'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useRef } from 'react'

const config = {
  authorizerURL: 'https://authorizer-newww.koyeb.app/',
  authorizerClientId: 'd5814c60-03ba-4568-ac96-70eb7a8f397f', // obtain your client id from authorizer dashboard
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

  return (
    <Suspense fallback={<div />}>
      <AuthorizerProvider
        config={{
          authorizerURL: config.authorizerURL,
          redirectURL: typeof window !== 'undefined' && window.location.origin,
          clientID: config.authorizerClientId,
        }}
      >
        <Center w={'100vw'} h={'100vh'} bg={'black'}>
          <Toolbar font={font} fonts={fonts} />
          <Flex
            // Spread
            bg={'#FFF'}
            id={bookLayoutStore.layoutOption.value}
          >
            <Flex
              // Verso
              w={'588px'}
              h={'838px'}
              flexWrap={'wrap'}
              position={'relative'}
              m={'46px'}
              _before={{
                content: bookLayoutStore.editMode ? `'Verso'` : `''`,
                fontSize: '12px',
                color: '#FFF',
                position: 'absolute',
                bottom: '-88px',
                width: '100%',
                textAlign: 'center',
              }}
              _after={{
                content: '""',
                display: bookLayoutStore.editMode ? 'block' : 'none',
                position: 'absolute',
                bottom: '0',
                height: '1px',
                background: 'red',
                width: '100%',
              }}
            >
              {bookLayoutStore.spread.verso?.map((col, idx) => (
                <Column
                  key={col.colId}
                  {...col}
                  update={{ page: 'verso', col: idx }}
                />
              ))}
            </Flex>
            <Flex
              // Recto
              w={'588px'}
              h={'838px'}
              flexWrap={'wrap'}
              position={'relative'}
              m={'46px'}
              _before={{
                content: bookLayoutStore.editMode ? `'Recto'` : `''`,
                fontSize: '12px',
                color: '#FFF',
                position: 'absolute',
                bottom: '-88px',
                width: '100%',
                textAlign: 'center',
              }}
              _after={{
                content: '""',
                display: bookLayoutStore.editMode ? 'block' : 'none',
                position: 'absolute',
                bottom: '0',
                height: '1px',
                background: 'red',
                width: '100%',
              }}
            >
              {bookLayoutStore.spread.recto?.map((col, idx) => (
                <Column
                  key={col.colId}
                  {...col}
                  update={{ page: 'recto', col: idx }}
                />
              ))}
            </Flex>
          </Flex>
        </Center>
      </AuthorizerProvider>
    </Suspense>
  )
}

export default observer(BookPage)
