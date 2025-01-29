// This is a Server Component
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: {
    slug: string
  }
}) {
  return children
}
