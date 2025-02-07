import { useEffect } from 'react'

interface Props {}

function onUnload() {
  sessionStorage && sessionStorage.removeItem('sessionId')
}

export const SessionId: React.FC<Props> = ({}) => {
  // @TODO: move to a nested component (this is for tracking client sessionIds in our API) (??)
  useEffect(() => {
    sessionStorage &&
      sessionStorage.setItem(
        'sessionId',
        Math.random().toString(36).substr(2, 16)
      )
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])
  return <></>
}
