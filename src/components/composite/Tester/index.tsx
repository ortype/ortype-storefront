import { toaster } from '@/components/ui/toaster'
import { UPDATE_TESTER_BY_ID } from '@/graphql/mutations'
import { GET_TESTER_BY_FONTID } from '@/graphql/queries'
import { ON_TESTER_UPDATED } from '@/graphql/subscriptions'
import { decodeOpaqueId } from '@/lib/utils/decoding'
import type { Font, FontVariant } from '@/sanity/lib/queries'
import { useMutation, useQuery } from '@apollo/client'
import {
  Box,
  Button,
  Link as ChakraLink,
  Flex,
  HStack,
  Text,
} from '@chakra-ui/react'
import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Editable from './Editable'
import { TieredSelect } from './TieredSelect'
import TypingIndicator from './TypingIndicator'

interface Props {
  title: string
  fontId: string
  index: number
  slug: string
  variants: FontVariant[]
  styleGroups: {
    groupName: string
    variants?: FontVariant[]
    italicVariants?: FontVariant[]
  }[]
  defaultVariantId: string
  href: string
  encodeDataAttribute?: EncodeDataAttributeCallback
}

// export default function Tester({ _id, name, slug }: Omit<Font, '_type'>) {
export const Tester: React.FC<Props> = (props) => {
  const {
    index,
    encodeDataAttribute,
    fontId,
    title,
    slug,
    variants,
    styleGroups,
    defaultVariantId,
    href,
    table,
  } = props

  // is controlled by the focus and blur events of the input
  const [isEditing, setEditing] = useState('')
  const [entry, setEntry] = useState('')
  const [placeholder, setPlaceholder] = useState(undefined)
  const [currentVariantId, setVariantId] = useState(defaultVariantId)
  const [limiter, setLimiter] = useState(false)

  const handleVariantChange = (value) => {
    console.log('handleVariantChange: ', value)
    if (!value || value.length === 0) return
    setVariantId(value[0])
    handleUpdateFontTester({
      addEntry: false,
      sessionId: '',
      isEditing: '',
      variantId: value[0],
    })
  }

  const { subscribeToMore, loading, data } = useQuery(GET_TESTER_BY_FONTID, {
    variables: { fontId },
  })

  const [updateFontTesterById] = useMutation(UPDATE_TESTER_BY_ID)

  const handleUpdateFontTester = ({
    addEntry,
    sessionId,
    isEditing,
    variantId,
  }) => {
    updateFontTesterById({
      variables: {
        input: {
          entry: entry.trim(), // make sure there are no leading or trailing white-spaces
          fontId,
          variantId: variantId || currentVariantId,
          sessionId,
          isEditing,
        },
        addEntry,
      },
    })
  }

  // Set state when query loads or changes
  useEffect(() => {
    if (loading === false && data && data.fontTesterById) {
      const {
        entry: latestEntry,
        variantId,
        sessionId,
        isEditing,
      } = data.fontTesterById
      if (!variantId) return
      // @NOTE: decodedVariantId is null
      const decodedVariantId = decodeOpaqueId(variantId)
      if (latestEntry) {
        setEditing(isEditing)
        setEntry(latestEntry)
        setPlaceholder(latestEntry)
        setVariantId(variantId)
      }
    }
  }, [loading, data]) // run on first render and re-render if data has changed

  // subscribeToMore
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: ON_TESTER_UPDATED,
      // Pass a specific ID to attempt to listen to one item only
      // variables: { id: fontId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          console.warn('No subscription data received')
          return prev
        }

        const updatedTester = subscriptionData.data.fontTesterUpdated

        // Only update if IDs match (currently required as this fires for all fonts)
        if (prev.fontTesterById.fontId !== updatedTester.fontId) {
          return prev // Don't update if IDs don't match
        }

        return {
          ...prev,
          fontTesterById: {
            ...prev.fontTesterById,
            ...updatedTester,
          },
        }
      },
      onError: (error) => {
        console.error('Subscription error:', error)
      },
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [subscribeToMore])

  const handleChange = (event) => {
    const value = event.target.value

    // Check if the input would exceed 10 characters
    if (value.length > 10) {
      // Trigger the limiter only when trying to exceed 10 characters
      setLimiter(true)

      // Reset the notification state after a delay (for animation purposes)
      setTimeout(() => {
        setLimiter(false)
      }, 500)
    }

    // Only update if the length is within our limit
    if (value.length <= 10) {
      setEntry(value)
    }
  }

  useEffect(() => {
    // Don't attach handler if not editing
    if (isEditing !== sessionStorage.getItem('sessionId')) {
      window.onbeforeunload = null
      return
    }

    // Solution 1: Use synchronous beforeunload handler
    const handleBeforeUnload = (event) => {
      // Try to run the mutation
      try {
        // Call the mutation synchronously - note this may not complete before page unload
        handleUpdateFontTester({
          addEntry: false,
          sessionId: '',
          isEditing: '',
        })
      } catch (error) {
        console.error('Error in beforeunload handler:', error)
      }
    }

    // Attach the handler
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isEditing, fontId, entry, currentVariantId, updateFontTesterById])

  const disabled =
    isEditing?.length > 0 && isEditing !== sessionStorage.getItem('sessionId')
  if (disabled) return <TypingIndicator />
  // console.log('GET_FONT_TESTER_BY_ID: ', fontId, title, data?.fontTesterById)
  return (
    <>
      <Editable
        table={table}
        handleUpdateFontTester={handleUpdateFontTester}
        handleChange={handleChange}
        entry={entry}
        placeholder={placeholder}
        fontId={fontId}
        variantId={currentVariantId}
        index={index}
        isDisabled={disabled}
        loading={loading}
        limiter={limiter}
      />
      <Flex align={'center'} justify={'center'}>
        <HStack gap={6}>
          <Button
            variant={'block'}
            size={table ? 'xs' : 'sm'}
            asChild
            tabIndex={-1}
          >
            <Link
              href={`/fonts/${slug}`}
              data-sanity={encodeDataAttribute?.(['fonts', index, 'slug'])}
            >
              <Text as={'span'} fontSize="md">
                {`${title}`}
              </Text>
            </Link>
          </Button>
          <HStack gap={6} display={table ? 'none' : 'flex'}>
            {variants.length > 1 && (
              <TieredSelect
                currentVariantId={currentVariantId}
                variants={variants}
                styleGroups={styleGroups}
                handleVariantChange={handleVariantChange}
                tabIndex={-1} /* Prevent tab focus */
              />
            )}
          </HStack>
          {/*<Box display={table ? 'none' : 'flex'}>
            <ChakraLink
              as={Link}
              href={`/fonts/${slug}/book/`}
              className="hover:underline"
              tabIndex={-1}
            >
              <Text as={'span'} fontSize="xs">
                ({'Book'})
              </Text>
            </ChakraLink>
          </Box>*/}
        </HStack>
      </Flex>
    </>
  )
}
