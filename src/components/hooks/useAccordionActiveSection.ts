import { useState, useContext } from 'react'

import { SettingsContext } from '@/components/data/SettingsProvider'

type UseAccordionActiveSection = {
  activeSection: OrderSectionEnum
  setActiveSection: (section: OrderSectionEnum) => void
  isLoading: boolean
  sections: OrderSectionEnum[]
}

const SECTIONS: OrderSectionEnum[] = [
  'Summary',
  'Addresses',
  'Shipments',
  'Payments',
]

export const useAccordionActiveSection = (): UseAccordionActiveSection => {
  const [activeSection, setActiveSection] =
    useState<OrderSectionEnum>('Summary')
  const [sections] = useState<OrderSectionEnum[]>(SECTIONS)

  const ctx = useContext(SettingsContext)

  if (!ctx)
    return {
      activeSection,
      setActiveSection,
      isLoading: true,
      sections,
    }

  const { isLoading } = ctx

  return {
    activeSection,
    setActiveSection,
    isLoading,
    sections,
  }
}
