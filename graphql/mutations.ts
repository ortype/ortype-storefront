import { gql } from '@apollo/client'

export const UPDATE_TESTER_BY_ID = gql`
  # Update
  mutation updateFontTesterByIdMutation(
    $input: PoemEntryInput!
    $addEntry: Boolean
  ) {
    updateFontTesterById(input: $input, addEntry: $addEntry) {
      entry {
        _id
        entry
        sessionId
        createdAt
        fontId
        fontUid
        variantId
        variantUid
        isEditing
        updatedAt
      }
    }
  }
`

export const ADD_BOOK_LAYOUT = gql`
  mutation addBookLayoutMutation(
    $spread: BookLayoutInput!
    $fontId: ID!
    $name: String!
    $isTemplate: Boolean
  ) {
    addBookLayout(
      spread: $spread
      name: $name
      fontId: $fontId
      isTemplate: $isTemplate
    ) {
      _id
      name
      fontId
      fontUid
      isTemplate
      spread {
        verso {
          width
          blocks {
            variantId
            fontSize
            lineHeight
            lineGap
            marginBottom
            wordCount
            lineCount
            regex
            noSpace
            noGibberish
            isParagraph
          }
        }
        recto {
          width
          blocks {
            fontSize
            lineHeight
            lineGap
            marginBottom
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

export const REMOVE_BOOK_LAYOUT = gql`
  mutation removeBookLayoutMutation($bookLayoutId: ID!) {
    removeBookLayout(bookLayoutId: $bookLayoutId) {
      bookLayout {
        _id
      }
    }
  }
`

export const UPDATE_BOOK_LAYOUT = gql`
  mutation updateBookLayoutMutation(
    $_id: ID!
    $spread: BookLayoutInput!
    $fontId: ID
    $isTemplate: Boolean
  ) {
    updateBookLayout(
      _id: $_id
      spread: $spread
      fontId: $fontId
      isTemplate: $isTemplate
    ) {
      fontId
      fontUid
      isTemplate
      _id
      spread {
        verso {
          width
          blocks {
            fontSize
            lineHeight
            lineGap
            marginBottom
            wordCount
            lineCount
            regex
            noSpace
            noGibberish
            isParagraph
          }
        }
        recto {
          width
          blocks {
            fontSize
            lineHeight
            lineGap
            marginBottom
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

export const UPDATE_BOOK_LAYOUT_NAME = gql`
  mutation updateBookLayoutNameMutation($bookLayoutId: ID!, $name: String!) {
    updateBookLayoutName(bookLayoutId: $bookLayoutId, name: $name) {
      bookLayoutId
      name
    }
  }
`
