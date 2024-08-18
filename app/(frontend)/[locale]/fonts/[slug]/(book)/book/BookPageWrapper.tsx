'use client'
import BookPage from './BookPage'
import Login from '@/components/composite/Book/Login'

// @NOTE: having issues with server/client component without this 'use client' wrapper
// but I think that isn't the expected behavior... currently unsure.
export default async function Page(props) {
  return props.admin ? (
    <BookPage data={props.data} admin={props.admin} />
  ) : (
    <Login />
  )
}
