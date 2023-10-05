import { useMutation, useQuery } from '@apollo/client'
import { Text } from '@chakra-ui/react'
import { UPDATE_TESTER_BY_ID } from 'graphql/mutations'
import { GET_LATEST_POEM_ENTRIES, GET_TESTER_BY_FONTID } from 'graphql/queries'
import { ON_TESTER_UPDATED } from 'graphql/subscriptions'
import type { Font, FontVariant } from 'lib/sanity.queries'
import { decodeOpaqueId } from 'lib/utils/decoding'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Editable from './Editable'

interface Props {
  title: string
  fontId: string
  index: number
  slug: string
  variants: FontVariant[]
  defaultVariantId: string
}

// export default function Tester({ _id, name, slug }: Omit<Font, '_type'>) {
export const Tester: React.FC<Props> = (props) => {
  const { index, fontId, title, slug, variants, defaultVariantId } = props

  // is controlled by the focus and blur events of the input
  const [isEditing, setEditing] = useState(false)
  const [entry, setEntry] = useState(undefined)
  const [placeholder, setPlaceholder] = useState(undefined)
  const [currentVariantId, setVariantId] = useState(defaultVariantId)

  // Variant options @TODO: Move to dedicated component
  // select menu options
  const variantOptions = variants.map((variant) => ({
    label: variant.name,
    value: variant._id,
  }))
  const defaultVariantOption = variantOptions.find(
    (opt) => opt.value === defaultVariantId
  )
  const [currentVariantOption, setVariantOption] =
    useState(defaultVariantOption)
  const handleVariantChange = (option) => {
    if (!option) return
    setVariantOption(option)
    setVariantId(option.value)
  }

  const { subscribeToMore, loading, data } = useQuery(GET_TESTER_BY_FONTID, {
    variables: { fontId },
  })

  const [updateFontTesterById] = useMutation(UPDATE_TESTER_BY_ID)

  const handleUpdateFontTester = ({ addEntry, sessionId }) => {
    setEditing(sessionId)
    updateFontTesterById({
      variables: {
        input: {
          entry,
          fontId,
          variantId: defaultVariantId, // currentVariantId,
          isEditing: sessionId,
          sessionId,
        },
        addEntry,
      },
    })
  }

  useEffect(() => {
    console.log('useEffect isEditing dependency: ', isEditing)
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
      const decodedVariantId = decodeOpaqueId(variantId)
      if (latestEntry) {
        setEditing(isEditing)
        setEntry(latestEntry)
        setPlaceholder(latestEntry)
        setVariantId(decodedVariantId)
        setVariantOption(
          variantOptions.find((opt) => opt.value === decodedVariantId)
        )
      }
    }
  }, [loading, data]) // run on first render and re-render if data has changed

  // Subscription to `onFontTesterUpdated`
  useEffect(() => {
    subscribeToMore({
      document: ON_TESTER_UPDATED,
      updateQuery: (prev, { subscriptionData }) => {
        let prevEntry
        if (prev && prev.entry) {
          prevEntry = prev.entry
        }
        if (!subscriptionData.data) return prevEntry
        const newPoemEntry = subscriptionData.data.entryAdded
        return Object.assign({}, prev, { newPoemEntry, ...prev })
      },
    })
  }, []) // runs once to init subscribeToMore

  const handleChange = (event) => {
    // here we can check character limit
    // event.target.value.length
    setEntry(event.target.value)
  }

  if (loading) return <p>Loading ...</p>
  console.log('GET_FONT_TESTER_BY_ID: ', fontId, title, data?.fontTesterById)
  return (
    <div>
      <Editable
        handleUpdateFontTester={handleUpdateFontTester}
        handleChange={handleChange}
        entry={entry}
        placeholder={placeholder}
        fontId={fontId}
        variantId={defaultVariantId}
        // variantId={currentVariantId}
        index={index}
        isDisabled={
          isEditing && isEditing !== sessionStorage.getItem('sessionId')
        }
      />
      <Link href={`/fonts/${slug}`} className="hover:underline">
        <Text as={'div'} fontSize="md">
          {title}
        </Text>
      </Link>
    </div>
  )
}
