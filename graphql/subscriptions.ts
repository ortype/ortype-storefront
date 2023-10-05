import { gql } from '@apollo/client'

export const SUB_FONT_TESTER_BY_ID = gql`
  # on add poem entry
  subscription onFontTesterUpdated {
    fontTesterUpdated {
      _id
      entry
      sessionId
      insertDate
      fontId
      variantId
      isEditing
      updatedAt
    }
  }
`
