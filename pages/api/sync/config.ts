import type { NextApiRequest, NextApiResponse } from 'next'
import { getIntegrationToken } from '@commercelayer/js-auth'
import CommerceLayer, { InventoryStockLocationCreate, MarketCreate, MerchantCreate, PriceListCreate, ShippingCategoryCreate } from '@commercelayer/sdk'
import { AddressCreate } from '@commercelayer/sdk/lib/cjs/resources/addresses'


interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    _id: string;
    name: string;
    description: string;
  };
}

export default async function config(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {

  try {

    const token = await getIntegrationToken({
      clientId: process.env.CL_SYNC_CLIENT_ID,
      clientSecret: process.env.CL_SYNC_CLIENT_SECRET,
      endpoint: process.env.CL_ENDPOINT
    })

    const cl = CommerceLayer({
      organization: 'or-type-mvp',
      accessToken: token.accessToken
    })

    console.log('req:', req.method, req.body)

    const addresses = await cl.addresses.list({ filters: { company_eq: 'Or Type' } })
    let address
    if (addresses.length) {
      address = addresses.shift()
    } else {
      address = await cl.addresses.create(<AddressCreate>{
        business: true,
        company: 'Or Type',
        full_name: 'Or Type',
        line_1: 'Hverfisgata 115',
        city: 'Reykjavík',
        zip_code: '101',
        state_code: 'Captial Region',
        country_code: 'IS',
        phone: '+49 152 25 37 09 36',
      })
    }
    const merchants = await cl.merchants.list({ filters: { name_eq: 'Or Type' } })
    let merchant
    if (merchants.length) {
      merchant = merchants.shift()
    } else {
      merchant = await cl.merchants.create(<MerchantCreate>{
        name: 'Or Type',
        address
      })
    }
    const stockLocations = await cl.stock_locations.list({ filters: { name_eq: 'Main' } })
    let stockLocation
    if (stockLocations.length) {
      stockLocation = stockLocations.shift()
    } else {
      stockLocation = await cl.stock_locations.create({
        name: 'Main',
        address
      })
    }
    const inventoryModels = await cl.inventory_models.list({ filters: { name_eq: 'Main' } })
    let inventoryModel
    if (inventoryModels.length) {
      inventoryModel = inventoryModels.shift()
    } else {
      inventoryModel = await cl.inventory_models.create({
        name: 'Main'
      })
    }
    const inventoryStockLocations = await cl.inventory_stock_locations.list({ filters: {
      inventory_model_id_eq: inventoryModel.id,
      stock_location_id_eq: stockLocation.id
    } })
    if (!inventoryStockLocations.length) {
      await cl.inventory_stock_locations.create(<InventoryStockLocationCreate>{
        priority: 1,
        on_hold: false,
        stock_location: stockLocation,
        inventory_model: inventoryModel
      })
    }
    const priceLists = await cl.price_lists.list({ filters: { name_eq: 'Base Price' } })
    let priceList
    if (priceLists.length) {
      priceList = priceLists.shift()
    } else {
      priceList = await cl.price_lists.create(<PriceListCreate>{
        name: 'Base Price',
        currency_code: 'EUR'
      })
    }
    const markets = await cl.markets.list({ filters: {
        merchant_id_eq: merchant.id,
        inventory_model_id_eq: inventoryModel.id,
        price_list_id_eq: priceList.id,
        name_eq: 'Global'
      } })
    if (!markets.length) {
      await cl.markets.create(<MarketCreate>{
        merchant,
        price_list: priceList,
        inventory_model: inventoryModel,
        name: 'Global'
      })
    }

    const shippingCategories = await cl.shipping_categories.list({ filters: { name_eq: 'Virtual' } })
    if (!shippingCategories.length) {
      await cl.shipping_categories.create(<ShippingCategoryCreate>{
        name: 'Virtual',
      })
    }

    return res.status(200).json(merchants)
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error,
    })
  }
}
