import { useMutation } from '@apollo/client'
import { Box, Button, HStack, Input, Text } from '@chakra-ui/react'
import { useBookLayoutStore } from 'components/data/BookProvider'
import { UPDATE_BOOK_LAYOUT_NAME } from 'graphql/mutations'
import { GET_BOOK_LAYOUTS } from 'graphql/queries'
import { observer } from 'mobx-react-lite'
import { useRapidForm } from 'rapid-form'
import React, { useEffect, useState } from 'react'

const NameForm = ({ bookLayoutId, name }) => {
  const bookLayoutStore = useBookLayoutStore()

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
          setIsDirty(false)
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
      refetchQueries: layoutsRefetchQueries, // @TODO: this updates the layoutOptions in the TieredSelect
    })
  }

  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm()

  const s = async (values, err, e) => {
    const name = values['name'].value
    handleNameChangeSave({ name })
  }

  const [isDirty, setIsDirty] = useState(false)
  const [nameValue, setNameValue] = useState('')

  const handleChange = (e) => {
    setNameValue(e.target.value)
    // checkIfDirty
    if (name !== e.target.value) {
      setIsDirty(true)
    } else {
      setIsDirty(false)
    }
  }

  useEffect(() => {
    setNameValue(name)
  }, [name])

  // @TODO:
  // consider using an uncontrolled component via useRef
  // https://sentry.io/answers/uncontrolled-inputs-react/
  // but actually with the useRapidForm, we kinda don't need that

  return (
    <Box
      as={'form'}
      w={'25rem'}
      m={'0 0.5rem'}
      ref={submitValidation}
      autoComplete="off"
      onSubmit={handleSubmit(s)}
    >
      <Text fontSize={'sm'}>{'Layout name'}</Text>
      <HStack spacing={2}>
        <Input
          name={'name'}
          type={'text'}
          variant={'flushed'}
          // ref={validation} // @TODO: this validation ref causes onChange handler to not fire weirdly
          size={'lg'}
          value={nameValue}
          placeholder={'Layout name'}
          isReadOnly={updateNameLoading}
          onChange={handleChange}
        />
        {isDirty && (
          <Button
            type={'submit'}
            variant={'outline'}
            isLoading={updateNameLoading}
          >
            <Text fontSize={'sm'}>{`Save`}</Text>
          </Button>
        )}
      </HStack>
    </Box>
  )
}

export default observer(NameForm)
