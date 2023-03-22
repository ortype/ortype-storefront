const settings = {
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
  price_lists: [
    {
      name: 'Small',
      currency: 'EUR',
      tax_included: true,
      reference: 'price_list_1',
      reference_origin: 'SANITY SYNC',
    },
    {
      name: 'Medium',
      currency: 'EUR',
      tax_included: true,
      reference: 'price_list_2',
      reference_origin: 'SANITY SYNC',
    },
    {
      name: 'Large',
      currency: 'EUR',
      tax_included: true,
      reference: 'price_list_3',
      reference_origin: 'SANITY SYNC',
    },
  ],
  // "Platforms"
  // resource ID (the CSV import uses "market_id" but not sure if this is correct)
  // https://docs.commercelayer.io/core/importing-resources#unique-keys
  sku_options: [
    {
      market_id: '',
      current: 'EUR',
      name: 'Desktop',
      reference: 'sku_option_1',
      reference_origin: 'SANITY SYNC',
      price: 9000, // in cents
    },
    {
      market_id: '', // resource ID
      current: 'EUR',
      name: 'Web',
      reference: 'sku_option_2',
      reference_origin: 'SANITY SYNC',
      price: 9000, // in cents
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
