import { gql } from '@apollo/client'

export const GET_POEM_ENTRIES = gql`
  query Poems(
    $first: ConnectionLimitInt
    $offset: Int
    $isLatinBasic: Boolean
    $fontIds: [ID!]
    $isDup: Boolean
  ) {
    poems(
      first: $first
      offset: $offset
      isLatinBasic: $isLatinBasic
      fontIds: $fontIds
      isDup: $isDup
    ) {
      edges {
        node {
          _id
          entry
          fontId
          variantId
          slug
          title
        }
      }
    }
  }
`

export const GET_LATEST_POEM_ENTRIES = gql`
  # Get the latest poem entry by fontId
  query getLatestPoemEntry($fontId: ID!) {
    latestPoemEntry: latestPoemEntry(fontId: $fontId) {
      entry
      internalId
      _id
      fontId
      variantId
    }
  }
`

export const GET_TESTER_BY_FONTID = gql`
  # Get the latest tester data by fontId
  query getFontTesterById($fontId: ID!) {
    fontTesterById: fontTesterById(fontId: $fontId) {
      entry
      internalId
      _id
      fontId
      variantId
      isEditing
      updatedAt
    }
  }
`
