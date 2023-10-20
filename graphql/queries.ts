import { gql } from '@apollo/client'

/*
export const GET_NOVELS = gql`
    query Novels {
        novels {
            id
            image
            createdAt
            title
            updatedAt
            authors {
                id
                name
                novelId
            }
        }
    }
`;
*/

export const GET_MOVIES = gql`
  query GetMovies {
    getMovies {
      _id
      title
      rating
      year
    }
  }
`

export const GET_MOVIE = gql`
  query GetMovie($getMovieId: ID!) {
    getMovie(id: $getMovieId) {
      _id
      title
      rating
      year
    }
  }
`
