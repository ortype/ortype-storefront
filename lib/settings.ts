export interface Type {
  value: string
  label: string
  basePrice: number | string
}

export interface Size {
  value: string
  label: string
  modifier: number
}

export const basePrice = 9000

export const types: Type[] = [
  {
    value: '1-licenseType-desktop',
    label: 'Desktop / Print',
    basePrice: 9000,
  },
  {
    value: '2-licenseType-web',
    label: 'Web',
    basePrice: '13000',
  },
  {
    value: '3-licenseType-app',
    label: 'App/Game',
    basePrice: '18000',
  },
]

export const sizes: Size[] = [
  {
    value: 'small',
    label: 'Small (1-5 employees)',
    modifier: 1,
  },
  {
    value: 'medium',
    label: 'Medium (6-50 employees)',
    modifier: 2,
  },
  {
    value: 'large',
    label: 'Large (51-100 employees)',
    modifier: 3,
  },
  {
    value: 'xlarge',
    label: 'XLarge (101+ employees)',
    modifier: 4,
  },
  {
    value: 'student',
    label: 'Student',
    modifier: 0.5,
  },
  {
    value: 'non-profit',
    label: 'Non-Profit Organisation',
    modifier: 0.75,
  },
]
