import { useMutation, useQuery } from '@apollo/client'
import { usePathname, useRouter } from 'next/navigation'

import { toaster } from '@/components/ui/toaster'
import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  Spinner,
  Text,
} from '@chakra-ui/react'

import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from '@/components/ui/dialog'

// import { Alert } from "@/components/ui/alert"

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from '@/components/ui/menu'

import Config from '@/components/composite/Book/Config'
import Logout from '@/components/composite/Book/Logout'
import { useBookLayoutStore } from '@/components/data/BookProvider'
import { defaultColumn } from '@/components/data/BookProvider/bookDefaults'
import StyledSelect from '@/components/ui/Select'
import {
  ADD_BOOK_LAYOUT,
  EXPORT_BOOK_LAYOUT,
  REMOVE_BOOK_LAYOUT,
  UPDATE_BOOK_LAYOUT,
} from '@/graphql/mutations'
import { GET_BOOK_LAYOUT, GET_BOOK_LAYOUTS } from '@/graphql/queries'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'

import {
  AddDocumentIcon,
  ChevronDownIcon,
  ClipboardImageIcon,
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
  }))
}

const Toolbar = observer(({ font, fonts, bookLayoutData }) => {
  const bookLayoutStore = useBookLayoutStore()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const cancelRef = React.useRef()
  const [fontLoading, setFontLoading] = useState(false)
  useEffect(() => {
    setFontLoading(false)
  }, [font])

  /*
  // @TODO: stop keydown handler from preventing entering text in an Input elsewhere on the page
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'e') {
        console.log('The "e" key was pressed.')
        bookLayoutStore.setEditMode(!bookLayoutStore.editMode)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, []) // Empty dependency array to ensure this is only run once on mount
*/
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

  const handleFontFamilyChange = async (option) => {
    if (!option) return
    bookLayoutStore.setFontFamily(option)
    const font = fonts.find(({ _id }) => _id === option.value)
    if (font) router.push(`/fonts/${font.slug}/book/`)
    // @TODO: loading indicator
    setFontLoading(true)
  }

  // @NOTE: this should be a completely reliable way to set the layout option
  // because the page has a useEffect that sets the layout via searchParams
  const handleLayoutChange = (option) => {
    if (option) {
      router.replace(`${pathname}/?id=${option.value}`, {
        scroll: false,
      })
    }
  }

  // mutations

  // updateBookLayout
  const [updateBookLayout, { data: updateData, loading: updateLoading }] =
    useMutation(UPDATE_BOOK_LAYOUT, {
      onCompleted: (data) => {
        toaster.create({
          title: 'Changes published.',
          description: 'The changes to the layout have been published.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      },
    })

  const [exportBookLayout, { data: exportData, loading: exportLoading }] =
    useMutation(EXPORT_BOOK_LAYOUT, {
      onError: (error) => {
        console.log('exportBookLayout error: ', error)
      },
      onCompleted: (data) => {
        console.log('exportBookLayout data: ', data)
        toaster.create({
          title: 'Snapshot exported.',
          description: 'A snapshot of this layout has been exported.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      },
    })

  // addBookLayout
  const [addBookLayout, { data: addData, loading: addLoading }] = useMutation(
    ADD_BOOK_LAYOUT,
    {
      onCompleted: (data) => {
        if (data.addBookLayout && data.addBookLayout._id) {
          handleLayoutChange({
            label: data.addBookLayout.name,
            value: data.addBookLayout._id,
          })
        }
        toaster.create({
          title: `Layout "${data.addBookLayout.name}" created.`,
          description: 'The layout has been created.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      },
    }
  )

  // removeBookLayout
  const [removeBookLayout, { data: removeData, loading: removeLoading }] =
    useMutation(REMOVE_BOOK_LAYOUT, {
      onCompleted: () => {
        // here we set another ID?
        const firstItem = groupedLayoutOptions[0].options[0]
        if (firstItem) {
          handleLayoutChange(firstItem) // layoutOptions object with value/label params
        }
        onClose() // close alert dialog box
        toaster.create({
          title: 'Layout deleted.',
          description: 'The layout has been permanently deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      },
    })

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
        name: 'New layout',
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
    setOpen(false)
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
        name: `${bookLayoutStore.layoutOption.label} (Duplicate)`,
        isTemplate: bookLayoutStore.isTemplate,
        fontId: bookLayoutStore.fontFamily.value,
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

  const handleDiscard = () => {
    // bookLayoutData from Apollo
    bookLayoutStore.setSpread(bookLayoutData.bookLayout.spread)
    bookLayoutStore.setIsTemplate(bookLayoutData.bookLayout.isTemplate)
    // @NOTE: using the bookLayoutData stored in the mobx store throws
    // maximum call stack size exceeded (where as using the data from apollo does not)
    // bookLayoutStore.setSpread(bookLayoutStore.bookLayoutData.spread)
    // bookLayoutStore.setIsTemplate(bookLayoutStore.bookLayoutData.isTemplate)
  }

  const handleExport = () => {
    if (bookLayoutStore.isTemplate) {
      // @TODO: toast with error about exporting templates
    } else {
      console.log('exporting...')
      exportBookLayout({
        variables: {
          fontId: bookLayoutStore.fontFamily.value,
          variantId: bookLayoutStore.variantOption.value,
          bookLayoutId: bookLayoutStore.layoutOption.value,
          spread: bookLayoutStore.spread,
          name: bookLayoutStore.layoutOption.label,
        },
      })
    }
  }

  return (
    <Box
      css={{
        position: `absolute`,
        width: '100vw',
        top: 0,
        zIndex: 11, // @NOTE: 1 higher than chakra.popover
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
            <StyledSelect
              placeholder="Select font"
              options={
                bookLayoutStore.fontFamilyOptions &&
                bookLayoutStore.fontFamilyOptions.constructor === Array
                  ? toJS(bookLayoutStore.fontFamilyOptions)
                  : []
              }
              value={bookLayoutStore.fontFamily}
              isLoading={fontLoading}
              name="font"
              onChange={handleFontFamilyChange}
            />
            <StyledSelect
              placeholder="Select layout"
              isReadOnly={layoutsLoading}
              isLoading={layoutsLoading}
              options={groupedLayoutOptions}
              value={bookLayoutStore.layoutOption} // @TODO: re-render this value when NameInput submits
              name="layouts"
              onChange={handleLayoutChange}
            />

            <Config />

            <ButtonGroup attached variant={'outline'}>
              <Button
                variant={'outline'}
                // isLoading={updateLoading}
                onClick={handleUpdate}
                disabled={!bookLayoutStore.isDirty}
              >
                {updateLoading ? (
                  <Spinner />
                ) : (
                  <PublishIcon width={'1.5rem'} height={'1.5rem'} />
                )}{' '}
                <Text fontSize={'sm'}>{`Publish`}</Text>
              </Button>
              <MenuRoot>
                <MenuTrigger as={IconButton} variant={'outline'}>
                  <ChevronDownIcon width={'1.5rem'} height={'1.5rem'} />
                </MenuTrigger>
                <MenuContent>
                  <MenuItem
                    disabled={!bookLayoutStore.isDirty}
                    onClick={handleDiscard}
                    value={'discard'}
                  >
                    <ResetIcon width={'1.5rem'} height={'1.5rem'} />
                    <Text fontSize={'sm'}>{`Discard changes`}</Text>
                  </MenuItem>
                  <MenuItem onClick={handleAdd} value={'add'}>
                    <AddDocumentIcon width={'1.5rem'} height={'1.5rem'} />
                    <Text fontSize={'sm'}>{`Create`}</Text>
                  </MenuItem>
                  <MenuItem onClick={handleDuplicate} value={'duplicate'}>
                    <CopyIcon width={'1.5rem'} height={'1.5rem'} />
                    <Text fontSize={'sm'}>{`Duplicate`}</Text>
                  </MenuItem>
                  <MenuItem onClick={() => setOpen(true)} value={'delete'}>
                    <TrashIcon width={'1.5rem'} height={'1.5rem'} />
                    <Text fontSize={'sm'}>{`Delete`}</Text>
                  </MenuItem>
                  <MenuItem onClick={handleExport} value={'export'}>
                    <ClipboardImageIcon width={'1.5rem'} height={'1.5rem'} />{' '}
                    <Text fontSize={'sm'}>{`Export snapshot`}</Text>
                  </MenuItem>
                </MenuContent>
              </MenuRoot>
            </ButtonGroup>
            <DialogRoot
              role="alertdialog"
              lazyMount
              open={open}
              onOpenChange={(e) => setOpen(e.open)}
            >
              <DialogContent>
                <DialogHeader fontSize="lg" fontWeight="normal">
                  Delete layout
                </DialogHeader>
                <DialogBody>
                  Are you sure? You can't undo this action afterwards.
                </DialogBody>

                <DialogFooter>
                  <DialogActionTrigger asChild ref={cancelRef}>
                    <Button variant={'outline'}>Cancel</Button>
                  </DialogActionTrigger>
                  <Button colorScheme="red" onClick={handleRemove} ml={3}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </DialogRoot>
            <Logout />
          </HStack>
        </>
      )}
      <IconButton
        css={{
          position: `fixed`,
          right: `1.5rem`,
          bottom: `1.5rem`,
          [`@media print`]: {
            display: `none`,
          },
        }}
        variant={'outline'}
        bg={'#000'}
        _hover={{ backgroundColor: '#555' }}
        // @TODO: consider Tooltip as a label
        onClick={() => bookLayoutStore.setEditMode(!bookLayoutStore.editMode)}
      >
        {bookLayoutStore.editMode ? (
          <EyeOpenIcon color={'#FFF'} width={'1.5rem'} height={'1.5rem'} />
        ) : (
          <EditIcon color={'#FFF'} width={'1.5rem'} height={'1.5rem'} />
        )}
      </IconButton>
    </Box>
  )
})

export default Toolbar
