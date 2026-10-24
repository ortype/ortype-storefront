import { BuyDialog } from '@/commercelayer/components/pages/buy/buy-dialog'
import type { ReactNode } from 'react'

export default function BuyLayout({ children }: { children: ReactNode }) {
  return <BuyDialog>{children}</BuyDialog>
}
