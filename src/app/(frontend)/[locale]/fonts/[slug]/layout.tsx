export default function FontSlugLayout({
  children,
  buy,
}: {
  children: React.ReactNode
  buy: React.ReactNode
}) {
  return (
    <>
      {children}
      {buy}
    </>
  )
}
