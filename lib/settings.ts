export default {
  // to create a market, we need an existing merchant, inventory model, and price list resource ID
  // https://docs.commercelayer.io/core/welcome/manual-configuration#market
  market: {
    name: 'Global',
    reference: 'market_1',
    reference_origin: 'SANITY SYNC',
    merchant: 'BbWgeHWZNb', // resource ID
    inventory_model: '', // resource ID
    price_list: '', // resource ID
  },
  currency: 'EUR',
  shipping_categories: [
    {
      name: 'Merchandising',
      reference: 'shipping_category_1',
      reference_origin: 'SANITY SYNC',
    },
  ],
  // "Size of company"
  // @TODO: we create SKU prices from this price list
  // @TODO: How would we create a 2 part price system with Platform + Company size
  // - Generate a price list for each combo: e.g. print-small, print-web-small, print-web-medium
  // - Generate prices for each price list
  price_lists: [
    {
      name: 'Small',
      currency: 'EUR',
      tax_included: true,
      reference: 'price_list_1',
      reference_origin: 'SANITY SYNC',
      modifier: 1,
    },
    {
      name: 'Medium',
      currency: 'EUR',
      tax_included: true,
      reference: 'price_list_2',
      reference_origin: 'SANITY SYNC',
      modifier: 1.5,
    },
    {
      name: 'Large',
      currency: 'EUR',
      tax_included: true,
      reference: 'price_list_3',
      reference_origin: 'SANITY SYNC',
      modifier: 3,
    },
  ],
  // "Platforms"
  // resource ID (the CSV import uses "market_id" but not sure if this is correct)
  // https://docs.commercelayer.io/core/importing-resources#unique-keys
  // sku_options: [
  platforms: [
    {
      market_id: '',
      current: 'EUR',
      name: 'Desktop',
      reference: 'platform_option_1',
      reference_origin: 'SANITY SYNC',
      price: 9000, // in cents
    },
    {
      market_id: '', // resource ID
      current: 'EUR',
      name: 'Web',
      reference: 'sku_option_2',
      reference_origin: 'SANITY SYNC',
      price: 14000, // in cents
    },
    {
      market_id: '', // resource ID
      current: 'EUR',
      name: 'App',
      reference: 'sku_option_3',
      reference_origin: 'SANITY SYNC',
      price: 36000, // in cents
    },
  ],
}

export interface Type {
  key: string
  label: string
  basePrice: number | string
}

export interface Size {
  key: string
  label: string
  modifier: number
}

export const basePrice = 9000

export const types: Type[] = [
  {
    key: 'print',
    label: 'Desktop / Print',
    basePrice: 9000,
  },
  {
    key: 'web',
    label: 'Web',
    basePrice: '13000',
  },
  {
    key: 'app',
    label: 'App/Game',
    basePrice: '18000',
  },
]

export const sizes: Size[] = [
  {
    key: 'small',
    label: 'Small (1-5 employees)',
    modifier: 1,
  },
  {
    key: 'medium',
    label: 'Medium (6-50 employees)',
    modifier: 2,
  },
  {
    key: 'large',
    label: 'Large (51-100 employees)',
    modifier: 3,
  },
  {
    key: 'xlarge',
    label: 'XLarge (101+ employees)',
    modifier: 4,
  },
  {
    key: 'student',
    label: 'Student',
    modifier: 0.5,
  },
  {
    key: 'non-profit',
    label: 'Non-Profit Organisation',
    modifier: 0.75,
  },
]
