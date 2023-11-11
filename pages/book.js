import { useQuery } from '@apollo/client'
import { Box, Center, Flex } from '@chakra-ui/react'
import Column from 'components/composite/Book/Column'
import Toolbar from 'components/composite/Book/Toolbar'
import {
  BookLayoutProvider,
  useBookLayoutStore,
} from 'components/data/BookProvider'
import useWindowSize from 'components/hooks/useWindowSize'
import { GET_BOOK_LAYOUT } from 'graphql/queries'
import { getAllFonts } from 'lib/sanity.client'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useLayoutEffect, useState } from 'react'

const Book = ({ fonts }) => {
  const bookLayoutStore = useBookLayoutStore()
  // get data from api
  const { loading, data } = useQuery(GET_BOOK_LAYOUT, {
    variables: { _id: bookLayoutStore.layoutOption.value }, // this is initially hardcoded
    // @TODO: store in localStorage (Mobx has a guide to do this I think)
  })

  // store data in mobx
  useEffect(() => {
    if (loading === false && data && data.bookLayout) {
      // fixed spread of null error
      console.log('calling setSpread: ', data.bookLayout.spread)
      bookLayoutStore.setSpread(data.bookLayout.spread) // this gets called a 2nd time when `bookLayoutStore.layoutOption.value` is by the toolbar
    }
  }, [loading, data])

  // invariant violantion, rendered more hooks then previous render
  // if (loading) return <PageLoading message="Loading layout..." />;
  // const { bookLayout: { spread: { verso, recto } } } = data;

  // scale value for responsive handling
  // we could output the scale as a statstic
  // and we could even offer a zoom function (with a reset)
  const { wWidth, wHeight } = useWindowSize()
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const bookHeight = 992 + 124 // margin + padding + height
    const bookWidth = 1460 // width
    if (wHeight - bookHeight >= 200 && wWidth - bookWidth >= 200) {
      setScale(1) // the max dimensions of book fit nicely
    } else if (wHeight > wWidth) {
      setScale(wWidth / (bookWidth + 200)) // portrait (use width)
    } else {
      setScale(wHeight / (bookHeight + 200)) // landscape (use height)
    }
  }, [wWidth, wHeight])

  // const thickness = 1 + (1 - scale);
  // const rounded = Math.round(thickness * 100) / 100;

  // render spread from data
  return (
    // @TODO: Background color
    <>
      <Center w={'100vw'} h={'100vh'} bg={'black'}>
        <Toolbar fonts={fonts} />
        <Flex
          // Spread
          // py={'77px'}
          // w={'1460px'}
          bg={'#FFF'}
          id={bookLayoutStore.layoutOption.value}
        >
          <Flex
            // Verso
            w={'588px'}
            h={'838px'}
            flexWrap={'wrap'}
            m={'46px'}
            editMode={bookLayoutStore.editMode}
          >
            {bookLayoutStore.spread.verso.map((col, idx) => (
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
            m={'46px'}
            editMode={bookLayoutStore.editMode}
          >
            {bookLayoutStore.spread.recto.map((col, idx) => (
              <Column
                key={col.colId}
                {...col}
                update={{ page: 'recto', col: idx }}
              />
            ))}
          </Flex>
        </Flex>
      </Center>
    </>
  )
}

export const getStaticProps = async (ctx) => {
  const [fonts = []] = await Promise.all([getAllFonts()])

  return {
    props: {
      fonts,
    },
  }
}

Book.getLayout = function getLayout(page) {
  return <BookLayoutProvider>{page}</BookLayoutProvider>
}

export default observer(Book)
