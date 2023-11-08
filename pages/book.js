import { useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import Column from 'components/composite/Book/Column'
import NameForm from 'components/composite/Book/NameForm'
import Toolbar from 'components/composite/Book/Toolbar'
import { BookContext, BookLayoutProvider } from 'components/data/BookProvider'
import useWindowSize from 'components/hooks/useWindowSize'
import { GET_BOOK_LAYOUT } from 'graphql/queries'
import { getAllFonts } from 'lib/sanity.client'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'

const Spread = styled(`div`)({
  // position: `relative`,
  display: `flex`,
  margin: '5rem',
  justifyContent: `space-around`,
  // margin: `120px auto 0`,
  padding: `77px 0`,
  width: `1460px`,
  // transformOrigin: `left top`,
  // position: `absolute`,
  // top: `50%`,
  // left: `50%`,
  backgroundColor: `#FFF`,
  // [`::before`]: {
  //   content: `" "`,
  //   width: `1px`,
  //   backgroundColor: `#000`,
  //   top: 0,
  //   bottom: 0,
  //   left: `50%`,
  //   position: `absolute`,
  // },
  // [`::after`]: {
  //   content: `" "`,
  //   position: `absolute`,
  //   // boxShadow: `0 0 0 1px #000`,
  //   backgroundColor: `#000`,
  //   top: `7px`,
  //   bottom: `-7px`,
  //   left: `7px`,
  //   right: `-7px`,
  //   zIndex: -1
  // }
})
/*, ({ scale }) => {
  const thickness = 1 + (1 - scale);
  const rounded = Math.round(thickness * 100) / 100;
  return {
    // boxShadow: `0 0 0 ${rounded}px #000`,
    [`::before`]: { width: `${rounded}px` },
    // [`::after`]: { boxShadow: `0 0 0 ${rounded}px #000` }
  };
});
*/

const Page = styled(`div`)({
  width: `588px`,
  display: `flex`,
  flexWrap: `wrap`,
  height: `838px`,
})

const Verso = styled(Page)({
  margin: `0 77px`,
})

const Recto = styled(Page)({
  margin: `0 77px`,
})

const Book = observer(({ fonts }) => {
  const bookLayoutStore = useContext(BookContext)
  // get data from api
  const { loading, data } = useQuery(GET_BOOK_LAYOUT, {
    variables: { _id: bookLayoutStore.layoutOption.value }, // this is initially hardcoded
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
    <>
      <Toolbar fonts={fonts} />
      {bookLayoutStore.editMode && (
        <NameForm
          bookLayoutId={bookLayoutStore.layoutOption.value}
          value={{ name: bookLayoutStore.layoutOption.label }}
        />
      )}
      <Spread
        style={{
          // transform: `scale(${scale}) translateX(-730px)`,
          // transform: `scale(6) translateX(-730px) translateY(-496px)`,
          boxShadow: `0 0 0 1px #000`,
          [`::before`]: { width: `1px` },
        }}
        id={bookLayoutStore.layoutOption.value}
        scale={scale}
      >
        <Verso editMode={bookLayoutStore.editMode}>
          {bookLayoutStore.spread.verso.map((col, idx) => (
            <Column
              key={col.colId}
              {...col}
              update={{ page: 'verso', col: idx }}
            />
          ))}
        </Verso>
        <Recto editMode={bookLayoutStore.editMode}>
          {bookLayoutStore.spread.recto.map((col, idx) => (
            <Column
              key={col.colId}
              {...col}
              update={{ page: 'recto', col: idx }}
            />
          ))}
        </Recto>
      </Spread>
    </>
  )
})

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

export default Book
