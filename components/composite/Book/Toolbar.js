import { useMutation, useQuery } from '@apollo/client'
import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
} from '@chakra-ui/react'
import Config from 'components/composite/Book/Config'
import { useBookLayoutStore } from 'components/data/BookProvider'
import { defaultColumn } from 'components/data/BookProvider/bookDefaults'
import {
  ADD_BOOK_LAYOUT,
  REMOVE_BOOK_LAYOUT,
  UPDATE_BOOK_LAYOUT,
} from 'graphql/mutations'
import { GET_BOOK_LAYOUT, GET_BOOK_LAYOUTS } from 'graphql/queries'
import { observer } from 'mobx-react-lite'
import React from 'react'
import TieredSelect from './TieredSelect'

import {
  ChevronDownIcon,
  ComposeIcon,
  CopyIcon,
  EditIcon,
  EyeOpenIcon,
  PublishIcon,
  ResetIcon,
  TrashIcon,
} from '@sanity/icons'

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
  const bookLayoutStore = useBookLayoutStore()

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

  const handleDiscard = () => {}

  return (
    <Box
      sx={{
        position: `absolute`,
        width: '100vw',
        top: 0,
        zIndex: 1,
        backgroundColor: `#FFF`,
        padding: `0 1rem`,
        [`@media print`]: {
          display: `none`,
        },
      }}
    >
      {bookLayoutStore.editMode && (
        <>
          <HStack spacing={2}>
            <TieredSelect
              fonts={fonts}
              layoutOptions={groupedLayoutOptions}
              layoutsLoading={layoutsLoading}
              handleLayoutChange={handleLayoutChange}
            />
            <Config />
            <ButtonGroup isAttached variant={'outline'}>
              <Button
                // isLoading={updateLoading}
                onClick={handleUpdate}
                leftIcon={
                  updateLoading ? (
                    <Spinner />
                  ) : (
                    <PublishIcon width={'1.5rem'} height={'1.5rem'} />
                  )
                }
              >
                <Text fontSize={'sm'}>{`Publish`}</Text>
              </Button>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<ChevronDownIcon width={'1.5rem'} height={'1.5rem'} />}
                />
                <MenuList>
                  <MenuItem
                    icon={<ResetIcon width={'1.5rem'} height={'1.5rem'} />}
                    isDisabled={true}
                    onClick={handleDiscard}
                  >
                    <Text fontSize={'sm'}>{`Discard changes`}</Text>
                  </MenuItem>
                  <MenuItem
                    isLoading={addLoading}
                    onClick={handleAdd}
                    icon={<ComposeIcon width={'1.5rem'} height={'1.5rem'} />}
                  >
                    <Text fontSize={'sm'}>{`Create`}</Text>
                  </MenuItem>
                  <MenuItem
                    isLoading={addLoading}
                    onClick={handleDuplicate}
                    icon={<CopyIcon width={'1.5rem'} height={'1.5rem'} />}
                  >
                    <Text fontSize={'sm'}>{`Duplicate`}</Text>
                  </MenuItem>
                  <MenuItem
                    isLoading={removeLoading}
                    onClick={handleRemove}
                    icon={<TrashIcon width={'1.5rem'} height={'1.5rem'} />}
                  >
                    <Text fontSize={'sm'}>{`Delete`}</Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            </ButtonGroup>
          </HStack>
        </>
      )}
      <IconButton
        sx={{
          position: `fixed`,
          right: `1.5rem`,
          bottom: `1.5rem`,
          [`@media print`]: {
            display: `none`,
          },
        }}
        variant={'outline'}
        _hover={{ backgroundColor: '#555' }}
        // @TODO: consider Tooltip as a label
        onClick={() => bookLayoutStore.setEditMode(!bookLayoutStore.editMode)}
        icon={
          bookLayoutStore.editMode ? (
            <EyeOpenIcon color={'#FFF'} width={'1.5rem'} height={'1.5rem'} />
          ) : (
            <EditIcon color={'#FFF'} width={'1.5rem'} height={'1.5rem'} />
          )
        }
      />
    </Box>
  )
})

export default Toolbar
