import { UPDATE_TESTER_BY_ID } from '@/graphql/mutations'
import {
  GET_LATEST_POEM_ENTRIES,
  GET_TESTER_BY_FONTID,
} from '@/graphql/queries'
import { ON_TESTER_UPDATED } from '@/graphql/subscriptions'
import { decodeOpaqueId } from '@/lib/utils/decoding'
import type { Font, FontVariant } from '@/sanity/lib/queries'
import { useMutation, useQuery } from '@apollo/client'
import { Box, Link as ChakraLink, Flex, HStack, Text } from '@chakra-ui/react'
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
    defaultVariantId,
    href,
  } = props

  // is controlled by the focus and blur events of the input
  const [isEditing, setEditing] = useState(false)
  const [entry, setEntry] = useState('')
  const [placeholder, setPlaceholder] = useState(undefined)
  const [currentVariantId, setVariantId] = useState(defaultVariantId)

  // Variant options @TODO: Move to dedicated component
  // select menu options
  const variantOptions = variants.map((variant) => ({
    label: variant.optionName,
    value: variant._id,
  }))

  const handleVariantChange = (value) => {
    console.log('handleVariantChange: ', value)
    if (!value || value.length === 0) return
    setVariantId(value[0])
    handleUpdateFontTester({
      addEntry: false,
      sessionId: '',
      variantId: value[0],
    })
  }

  const { subscribeToMore, loading, data } = useQuery(GET_TESTER_BY_FONTID, {
    variables: { fontId },
  })

  const [updateFontTesterById] = useMutation(UPDATE_TESTER_BY_ID)

  const handleUpdateFontTester = ({ addEntry, sessionId, variantId }) => {
    setEditing(sessionId)
    updateFontTesterById({
      variables: {
        input: {
          entry,
          fontId,
          variantId: variantId || currentVariantId,
          isEditing: sessionId,
          sessionId,
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
        handleUpdateFontTester({ addEntry: false, sessionId: '' })
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
      const { entry: latestEntry, variantId, isEditing } = data.fontTesterById
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
    // here we can check character limit
    // event.target.value.length
    setEntry(event.target.value)
  }

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
        isDisabled={
          isEditing && isEditing !== sessionStorage.getItem('sessionId')
        }
      />
      <Flex align={'center'} justify={'center'}>
        <HStack spacing={2}>
          <ChakraLink
            as={Link}
            href={`/fonts/${slug}`}
            data-sanity={encodeDataAttribute?.(['fonts', index, 'slug'])}
            css={{
              border: '2px solid #000',
              p: 2,
            }}
            _hover={{
              textDecoration: 'none',
              bg: '#000',
              color: '#fff',
            }}
          >
            <Text as={'span'} fontSize="md">
              {`${title}`}
            </Text>
          </ChakraLink>
          <TieredSelect
            currentVariantId={currentVariantId}
            variantOptions={variantOptions}
            handleVariantChange={handleVariantChange}
          />
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
