import { gql } from '@apollo/client'

export const ON_TESTER_UPDATED = gql`
  # on add poem entry
  subscription onFontTesterUpdated {
    fontTesterUpdated {
      _id
      entry
      sessionId
      createdAt
      internalId
      fontId
      variantId
      isEditing
      updatedAt
    }
  }
`

/*

subscription OnFontTesterUpdated($id: ID!) {
  fontTesterUpdated(id: $id) {
    id
    # other fields
  }
}

// The aboe ifs probably paired with passing a variable to subscribeToMore
```
subscribeToMore({
  document: ON_TESTER_UPDATED,
  variables: { id: testerId }, // Add this
  updateQuery: // ... rest of the code
});
```

// Make sure your cache keys are properly setup
// Items should be uniquely identified by their ID:
// would this be fontId?
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          fontTesterById: {
            // Ensure proper cache key
            keyArgs: ['id'],
          }
        }
      }
    }
  })
});

*/
