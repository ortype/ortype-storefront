import { gql } from '@apollo/client'

export const ON_TESTER_UPDATED = gql`
  # on add poem entry
  subscription onFontTesterUpdated {
    fontTesterUpdated {
      _id
      entry
      sessionId
      createdAt
      fontId
      variantId
      isEditing
      updatedAt
    }
  }
`
