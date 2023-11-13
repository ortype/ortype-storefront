import {
  BookLayoutProvider,
  useBookLayoutStore,
} from 'components/data/BookProvider'
import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { getAllFonts, getAllFontIds } from 'lib/sanity.client'
import { createApolloClient } from 'hooks/useApollo'
import { GET_BOOK_LAYOUTS, GET_BOOK_LAYOUT } from 'graphql/queries'
import { autorun, toJS } from 'mobx'
import { Center, Flex } from '@chakra-ui/react'
import Toolbar from 'components/composite/Book/Toolbar'
import Column from 'components/composite/Book/Column'

import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

const BookPage = () => {
  const bookLayoutStore = useBookLayoutStore()
  console.log('bookLayoutStore: ', toJS(bookLayoutStore))

  const { loading, data, refetch } = useQuery(GET_BOOK_LAYOUT, {
    variables: { _id: bookLayoutStore.layoutOption.value },
  })

  // store data in mobx
  useEffect(() => {
    if (loading === false && data && data.bookLayout) {
      /*
      const storedJson = localStorage.getItem(
        `${layoutId}_bookLayoutStore_spread`
      )
      */
      bookLayoutStore.setLayoutOption({value: data.bookLayout._id, label: data.bookLayout.name})
      bookLayoutStore.setSpread(data.bookLayout.spread)
      bookLayoutStore.setIsTemplate(data.bookLayout.isTemplate)
      bookLayoutStore.setBookLayoutData(data.bookLayout)
    }
  }, [loading, data])
  
  return (<>
    <Center w={'100vw'} h={'100vh'} bg={'black'}>
      <Toolbar />
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
            editMode={bookLayoutStore.editMode}
            _before={{
              content: bookLayoutStore.editMode ? `'Verso'` : `''`,
              fontSize: '12px',
              color: '#FFF',
              position: 'absolute',
              bottom: '-88px',
              width: '100%',
              textAlign: 'center',
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
            editMode={bookLayoutStore.editMode}
            _before={{
              content: bookLayoutStore.editMode ? `'Recto'` : `''`,
              fontSize: '12px',
              color: '#FFF',
              position: 'absolute',
              bottom: '-88px',
              width: '100%',
              textAlign: 'center',
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
  </>)
}

export const getStaticProps = async (ctx) => {
  const [fonts = []] = await Promise.all([getAllFonts()])
  const { params } = ctx
  const { fontId } = params  
  const client = createApolloClient()
  // @TODO: since this is just the initial layout option, we could request all layouts and
  // match the first fontId, or fallback to a template, or unassigned (but with one query)
  const { data: assignedLayouts } = await client.query({
    query: GET_BOOK_LAYOUTS,
    variables: { fontId: fontId }
  })
  const { data: templateLayouts } = await client.query({
    query: GET_BOOK_LAYOUTS,
    variables: { isTemplate: true }
  })  
  const { data: unassignedLayouts } = await client.query({
    query: GET_BOOK_LAYOUTS,
    variables: { isTemplate: false }
  })

  let initialBookLayout
  if (assignedLayouts.bookLayouts.nodes.length === 0) {
    initialBookLayout = templateLayouts.bookLayouts.nodes[0] || unassignedLayouts.bookLayouts.nodes[0]
  } else {
    initialBookLayout = assignedLayouts.bookLayouts.nodes[0]
  }

  const font = fonts.find(font => font._id === fontId)

  return {
    props: {
      fonts,
      font,
      initialBookLayout,
      bookLayouts: {
        assigned: assignedLayouts.bookLayouts.nodes,
        template: templateLayouts.bookLayouts.nodes,
        unassigned: unassignedLayouts.bookLayouts.nodes,
      }
    },
  };
}


// @TODO: switch this to slugs... so we have /book/similar
export const getStaticPaths = async () => {
  const ids = await getAllFontIds()
  return {
    paths: ids?.map(({ _id }) => `/book/${_id}`) || [],
    fallback: false,
  }
}

BookPage.getLayout = function getLayout(page) {
  const { query: { id } } = useRouter()
  console.log('layoutId', id)
  return (
    <BookLayoutProvider layoutId={id} {...page?.props}>{page}</BookLayoutProvider>
  )
}

export default observer(BookPage)
// export default BookPage

