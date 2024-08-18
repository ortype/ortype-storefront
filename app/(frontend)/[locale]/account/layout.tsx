import AccountContainer from 'components/composite/AccountContainer'

// This is a Server Component
export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AccountContainer>{children}</AccountContainer>
}
