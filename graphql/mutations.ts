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
        variantId
        isEditing
        updatedAt
      }
    }
  }
`
