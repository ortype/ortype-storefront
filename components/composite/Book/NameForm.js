import React, { useContext } from 'react'
// import { useReactoForm } from 'reacto-form'
import { useMutation } from '@apollo/client'
import { Button, Input, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { BookContext } from 'components/data/BookProvider'
import { UPDATE_BOOK_LAYOUT_NAME } from 'graphql/mutations'
import { GET_BOOK_LAYOUTS } from 'graphql/queries'

const Wrapper = styled(`div`)({
  position: `fixed`,
  left: `1rem`,
  bottom: `1rem`,
  width: `25rem`,
  margin: `0 0.5rem`,
  // display: `flex`,
  // flexDirection: `row`
  [`div`]: {
    display: `inline-block`,
    marginRight: `1rem`,
  },
})

const NameForm = ({ bookLayoutId, value }) => {
  const bookLayoutStore = useContext(BookContext)
  // mutation
  const [updateBookLayoutName, { loading: updateNameLoading }] = useMutation(
    UPDATE_BOOK_LAYOUT_NAME,
    {
      onCompleted: (data) => {
        if (data.updateBookLayoutName && data.updateBookLayoutName.name) {
          bookLayoutStore.setLayoutOption({
            label: data.updateBookLayoutName.name,
            value: data.updateBookLayoutName.bookLayoutId,
          })
        }
      },
    }
  )

  const layoutsRefetchQueries = [
    {
      query: GET_BOOK_LAYOUTS,
      variables: { fontId: bookLayoutStore.fontFamily.value },
    },
    {
      query: GET_BOOK_LAYOUTS,
      variables: { isTemplate: false },
    },
    {
      query: GET_BOOK_LAYOUTS,
      variables: { isTemplate: true },
    },
  ]

  const handleNameChangeSave = ({ name }) => {
    updateBookLayoutName({
      variables: {
        bookLayoutId,
        name,
      },
      refetchQueries: layoutsRefetchQueries,
    })
  }
  /*
  const { getInputProps, submitForm, isDirty } = useReactoForm({
    onSubmit: (formData) => {
      if (formData) {
        handleNameChangeSave(formData)
      }
    },
    validator: getRequiredValidator('name'),
    value,
    // setting an object to `value` causes an infinite rerender
    // the value object must be passed in (not sure when I wrote this)
  })
  */

  return (
    <Wrapper>
      <Input
        placeholder={`Layout name`}
        // {...getInputProps('name')}
        isReadOnly={updateNameLoading}
      />
      {/*isDirty && (
        <Button
          // actionType="secondary"
          isTextOnly
          isWaiting={updateNameLoading}
          // onClick={submitForm}
        >
          <Text fontSize={'sm'}>{`Save`}</Text>
        </Button>
      )*/}
    </Wrapper>
  )
}

export default NameForm
