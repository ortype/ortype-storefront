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
  } = props

  // is controlled by the focus and blur events of the input
  const [isEditing, setEditing] = useState('')
  const [entry, setEntry] = useState('')
  const [placeholder, setPlaceholder] = useState(undefined)
  const [currentVariantId, setVariantId] = useState(defaultVariantId)

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
          entry,
          fontId,
          variantId: variantId || currentVariantId,
          sessionId,
          isEditing,
        },
        addEntry,
      },
    })
  }

  useEffect(() => {
    if (isEditing === sessionStorage.getItem('sessionId')) {
      window.onbeforeunload = (event) => {
        // run mutation
        console.log('onbeforeunload: ', fontId)
        // clear item in fontTester cache of `isEditing` and `sessionId`
        handleUpdateFontTester({
          addEntry: false,
          sessionId: '',
          isEditing: '',
        })
        // event.returnValue = "";
        event.preventDefault()
        delete event.returnValue
      }
    }

    return () => {
      window.onbeforeunload = null
    }
  }, [isEditing])

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

        // console.log('Previous state:', prev)
        // console.log('Subscription data:', subscriptionData.data)

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
    // Only update if the length is within our limit
    if (event.target.value.length <= 10) {
      setEntry(event.target.value)
    }
  }

  const disabled =
    isEditing?.length > 0 && isEditing !== sessionStorage.getItem('sessionId')
  if (loading) return <TypingIndicator />
  // console.log('GET_FONT_TESTER_BY_ID: ', fontId, title, data?.fontTesterById)
  return (
    <>
      <Editable
        handleUpdateFontTester={handleUpdateFontTester}
        handleChange={handleChange}
        entry={entry}
        placeholder={placeholder}
        fontId={fontId}
        variantId={currentVariantId}
        index={index}
        isDisabled={disabled}
      />
      <Flex align={'center'} justify={'center'}>
        <HStack gap={6}>
          <Button variant={'block'} size={'sm'} asChild>
            <Link
              href={`/fonts/${slug}`}
              data-sanity={encodeDataAttribute?.(['fonts', index, 'slug'])}
            >
              <Text as={'span'} fontSize="md">
                {`${title}`}
              </Text>
            </Link>
          </Button>
          {variants.length > 1 && (
            <TieredSelect
              currentVariantId={currentVariantId}
              variants={variants}
              styleGroups={styleGroups}
              handleVariantChange={handleVariantChange}
            />
          )}
          <ChakraLink
            as={Link}
            href={`/fonts/${slug}/book/`}
            className="hover:underline"
          >
            <Text as={'span'} fontSize="xs">
              ({'Book'})
            </Text>
          </ChakraLink>
        </HStack>
      </Flex>
    </>
  )
}
