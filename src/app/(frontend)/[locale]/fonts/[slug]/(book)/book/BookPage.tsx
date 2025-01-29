'use client'

import { disableDraftMode } from '@/app/actions'
import Spread from '@/components/composite/Book/Spread'
import { useQuery } from '@apollo/client'
import { Box, Center, Flex, Text } from '@chakra-ui/react'
import Toolbar from '@/components/composite/Book/Toolbar'
import { useBookLayoutStore } from '@/components/data/BookProvider'
import { makeLocalStorage } from '@/components/utils/makeLocalStorage'
import { GET_BOOK_LAYOUT } from '@/graphql/queries'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect } from 'react'

const BookPage = ({
  data: { fonts = [], font = {}, initialBookLayout = {} },
}) => {
  // const firstUpdate = useRef(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const bookLayoutStore = useBookLayoutStore()

  // Disable draft mode when entering the book
  // @NOTE: this causes a loop, we need to trigger this or add a conditional
  /*  
  useEffect(() => {
    disableDraftMode().then(() => {
      router.refresh()
    })
  }, [])
  */

  /*  
  console.log(
    'bookLayoutStore: ',
    toJS(bookLayoutStore.fontFamily.label),
    toJS(bookLayoutStore.fontFamily.value),
    toJS(bookLayoutStore.layoutOption.label),
    'layoutId param: ',
    searchParams.get('id'),
    toJS(bookLayoutStore.spread?.verso[0]?.blocks[0]?.entry)
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
    <Box bg={'#000'} height={'100%'}>
      <Toolbar font={font} fonts={fonts} bookLayoutData={data} />
      <Spread />
    </Box>
  )
}

export default observer(BookPage)
