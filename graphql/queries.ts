import { gql } from '@apollo/client'

export const GET_WEBFONTS = gql`
  query getWebfonts {
    webfonts {
      webfonts {
        classId
        fontFamily
        woff
        woff2
        vf
        fontFamilyVariable
        fontVariationSettings
      }
    }
  }
`

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

export const GET_BOOK_ITEM = gql`
  query bookItemQuery(
    $dedupId: String
    $fontSize: Int
    $variantId: String
    $colWidth: Int
    $wordCount: Int
    $lineCount: Int
    $regex: String
    $noSpace: Boolean
    $noGibberish: Boolean
    $isParagraph: Boolean
    $text: [Text]
  ) {
    bookItem(
      dedupId: $dedupId
      fontSize: $fontSize
      variantId: $variantId
      colWidth: $colWidth
      wordCount: $wordCount
      lineCount: $lineCount
      regex: $regex
      noSpace: $noSpace
      noGibberish: $noGibberish
      isParagraph: $isParagraph
      text: $text
    ) {
      entry
    }
  }
`

export const GET_BOOK_LAYOUT = gql`
  query bookLayoutQuery($_id: ID) {
    bookLayout(_id: $_id) {
      _id
      name
      fontId
      isTemplate
      spread {
        verso {
          colId
          width
          blocks {
            blockId
            fontSize
            lineHeight
            wordCount
            lineCount
            regex
            noSpace
            noGibberish
            isParagraph
          }
        }
        recto {
          colId
          width
          blocks {
            blockId
            fontSize
            lineHeight
            wordCount
            lineCount
            regex
            noSpace
            noGibberish
            isParagraph
          }
        }
      }
    }
  }
`

export const GET_BOOK_LAYOUTS = gql`
  query bookLayoutsQuery($fontId: ID, $isTemplate: Boolean) {
    bookLayouts(fontId: $fontId, isTemplate: $isTemplate) {
      nodes {
        _id
        name
        isTemplate
        fontId
      }
    }
  }
`
