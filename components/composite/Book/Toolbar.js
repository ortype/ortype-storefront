import { Button, Checkbox, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { BookContext } from 'components/data/BookProvider'
import { defaultColumn } from 'components/data/BookProvider/bookDefaults'
import { GET_BOOK_LAYOUT, GET_BOOK_LAYOUTS } from 'graphql/queries'

import { useMutation, useQuery } from '@apollo/client'
import {
  ADD_BOOK_LAYOUT,
  REMOVE_BOOK_LAYOUT,
  UPDATE_BOOK_LAYOUT,
} from 'graphql/mutations'
import { observer } from 'mobx-react-lite'
import React, { useContext } from 'react'
import TieredSelect from './TieredSelect'

const Wrapper = styled(`div`)({
  position: `absolute`,
  right: `0`,
  left: `0`,
  top: `0`,
  backgroundColor: `#FFF`,
  zIndex: 9999,
  padding: `0 1rem`,
  [`@media print`]: {
    display: `none`,
  },
})

const StyledCheckbox = styled(Checkbox)({
  display: `inline-block`,
})

const ActionButton = styled(Button)({
  margin: `0 0.5rem`,
})

const ToggleButton = styled(Button)({
  position: `fixed`,
  right: `1.5rem`,
  bottom: `1.5rem`,
  [`@media print`]: {
    display: `none`,
  },
})

const layoutOptions = (layouts) => {
  const {
    bookLayouts: { nodes },
  } = layouts
  return nodes.map(({ _id, name, isTemplate }, index) => ({
    value: _id,
    label: name || `Layout ${index}`,
    isTemplate,
  }))
}

const Toolbar = observer(({ fonts }) => {
  const bookLayoutStore = useContext(BookContext)

  // queries
  // get layout data from api
  const { loading: assignedLayoutsLoading, data: assignedLayouts } = useQuery(
    GET_BOOK_LAYOUTS,
    { variables: { fontId: bookLayoutStore.fontFamily.value } }
  )

  const { loading: templateLayoutsLoading, data: templateLayouts } = useQuery(
    GET_BOOK_LAYOUTS,
    { variables: { isTemplate: true } }
  )

  const { loading: unassignedLayoutsLoading, data: unassignedLayouts } =
    useQuery(GET_BOOK_LAYOUTS, { variables: { isTemplate: false } })

  console.log('layouts...', assignedLayouts, templateLayouts, unassignedLayouts)

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

  const layoutsLoading =
    assignedLayoutsLoading || templateLayoutsLoading || unassignedLayoutsLoading

  const groupedLayoutOptions = [
    {
      label: bookLayoutStore.fontFamily.label,
      options:
        !layoutsLoading && assignedLayouts && layoutOptions(assignedLayouts),
    },
    {
      label: 'Templates',
      options:
        !layoutsLoading && templateLayouts && layoutOptions(templateLayouts),
    },
    {
      label: 'Unassigned',
      options:
        !layoutsLoading &&
        unassignedLayouts &&
        layoutOptions(unassignedLayouts),
    },
  ]

  const handleLayoutChange = (option) => {
    console.log('handleLayoutChange: ', option)
    if (option) {
      bookLayoutStore.setLayoutOption(option)
    }
    // weiredly calling bookLayoutStore.setIsTemplate here has no effect
  }

  // mutations

  // updateBookLayout
  const [updateBookLayout, { data: updateData, loading: updateLoading }] =
    useMutation(UPDATE_BOOK_LAYOUT)
  if (updateData) {
    console.log('updateData: ', updateData)
  }

  // addBookLayout
  const [addBookLayout, { data: addData, loading: addLoading }] = useMutation(
    ADD_BOOK_LAYOUT,
    {
      onCompleted: (data) => {
        if (data.addBookLayout && data.addBookLayout._id) {
          bookLayoutStore.setLayoutOption({
            label: data.addBookLayout.name,
            value: data.addBookLayout._id,
          })
        }
      },
    }
  )
  if (addData) {
    console.log('addData: ', addData)
  }

  // removeBookLayout
  const [removeBookLayout, { data: removeData, loading: removeLoading }] =
    useMutation(REMOVE_BOOK_LAYOUT, {
      onCompleted: () => {
        // here we set another ID?
        const firstItem = groupedLayoutOptions[0].options[0]
        if (firstItem) {
          bookLayoutStore.setLayoutOption(firstItem)
        }
      },
    })
  if (removeData) {
    console.log('removeData: ', removeData)
  }

  // how does the _id in addData get set in the store

  const handleUpdate = () => {
    updateBookLayout({
      variables: {
        fontId: bookLayoutStore.fontFamily.value,
        isTemplate: bookLayoutStore.isTemplate,
        _id: bookLayoutStore.layoutOption.value,
        spread: bookLayoutStore.spread,
      },
      refetchQueries: [
        {
          query: GET_BOOK_LAYOUT,
          variables: { _id: bookLayoutStore.layoutOption.value },
        },
        ...layoutsRefetchQueries,
      ],
    })
  }

  const handleAdd = () => {
    bookLayoutStore.setIsTemplate(false)
    addBookLayout({
      variables: {
        fontId: bookLayoutStore.fontFamily.value,
        isTemplate: false,
        spread: {
          verso: [defaultColumn()],
          recto: [defaultColumn()],
        },
      },
      refetchQueries: [
        {
          query: GET_BOOK_LAYOUT,
          variables: { _id: bookLayoutStore.layoutOption.value },
        },
        ...layoutsRefetchQueries,
      ],
    })
  }

  const handleRemove = () => {
    removeBookLayout({
      variables: {
        bookLayoutId: bookLayoutStore.layoutOption.value,
      },
      refetchQueries: layoutsRefetchQueries,
    })
  }

  const handleDuplicate = () => {
    addBookLayout({
      variables: {
        isTemplate: bookLayoutStore.isTemplate,
        fontId: bookLayoutStore.fontFamily.value,
        spread: bookLayoutStore.spread,
      },
      refetchQueries: layoutsRefetchQueries,
    })
  }

  const handleIsTemplateChange = (value) => {
    console.log('handleIsTemplateChange: ', value)
    bookLayoutStore.setIsTemplate(value)
  }

  return (
    <Wrapper>
      {bookLayoutStore.editMode && (
        <React.Fragment>
          <TieredSelect
            fonts={fonts}
            layoutOptions={groupedLayoutOptions}
            layoutsLoading={layoutsLoading}
            handleLayoutChange={handleLayoutChange}
          />
          <StyledCheckbox
            label="Is template"
            name="isTemplate"
            value={bookLayoutStore.isTemplate}
            onChange={handleIsTemplateChange}
          />
          <ActionButton
            actionType="secondary"
            isWaiting={updateLoading}
            onClick={handleUpdate}
          >
            <Text fontSize={'sm'}>{`Save 💾`}</Text>
          </ActionButton>
          <ActionButton
            actionType="secondary"
            isWaiting={addLoading}
            onClick={handleDuplicate}
          >
            <Text fontSize={'sm'}>{`Copy 📑`}</Text>
          </ActionButton>
          <ActionButton
            actionType="secondary"
            isWaiting={addLoading}
            onClick={handleAdd}
          >
            <Text fontSize={'sm'}>{`Add 📄`}</Text>
          </ActionButton>
          <ActionButton
            actionType="secondary"
            isWaiting={removeLoading}
            onClick={handleRemove}
          >
            <Text fontSize={'sm'}>{`Delete 🗑️`}</Text>
          </ActionButton>
        </React.Fragment>
      )}
      <ToggleButton
        actionType="secondary"
        onClick={() => bookLayoutStore.setEditMode(!bookLayoutStore.editMode)}
      >
        {bookLayoutStore.editMode ? `👀` : `✏️`}
      </ToggleButton>
    </Wrapper>
  )
})

export default Toolbar
