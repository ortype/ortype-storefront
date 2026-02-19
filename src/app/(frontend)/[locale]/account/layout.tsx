import AccountContainer from '@/commercelayer/components/pages/account/container'

// This is a Server Component
export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AccountContainer>{children}</AccountContainer>
}
