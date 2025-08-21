/**
 * Extract card brand from payment source data
 */
export function getCardBrand(paymentSource: any): string {
  if (!paymentSource) return 'default'

  // Check various possible properties where brand might be stored
  const possibleBrandFields = [
    'brand',
    'card_brand',
    'issuer_type',
    'payment_source_type',
    'type',
  ]

  for (const field of possibleBrandFields) {
    const brand = paymentSource[field] || paymentSource.card?.[field]
    if (brand && typeof brand === 'string') {
      return normalizeBrandName(brand)
    }
  }

  // Check if it's a specific payment method type
  if (paymentSource.payment_source_type) {
    return normalizeBrandName(paymentSource.payment_source_type)
  }

  return 'credit_card' // Default fallback
}

/**
 * Normalize brand names to consistent format
 */
function normalizeBrandName(brand: string): string {
  const normalized = brand.toLowerCase().replace(/[_\s-]/g, '_')

  const brandMap: Record<string, string> = {
    american_express: 'amex',
    americanexpress: 'amex',
    credit_cards: 'credit_card',
    credit_card: 'credit_card',
    stripe_payments: 'stripe',
    paypal_payments: 'paypal',
    wire_transfers: 'wire_transfer',
  }

  return brandMap[normalized] || normalized
}
