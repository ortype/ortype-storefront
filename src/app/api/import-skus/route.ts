import {
  getGroupSkuObjects,
  getSkuObject,
  jsonImport,
} from '@/commercelayer/utils/import'
import { getAllFonts, getAllFontVariants } from '@/sanity/lib/client'
import { parseBody } from 'next-sanity/webhook'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, res: NextResponse) {
  const importAll = false
  if (importAll) console.log('IMPORT ALL!!!') // hitting the route directly throws a 405 but the function runs

  try {
    const { body, isValidSignature } = await parseBody<{
      _type: string
      slug?: string | undefined
    }>(req, process.env.SANITY_WEBHOOK_SECRET)

    if (!isValidSignature && !importAll) {
      return new Response('Invalid Signature', { status: 401 })
    }

    if (!body?.variants && !importAll) {
      return new Response('Payload is missing variants', { status: 400 })
    }

    try {
      let styleSkuInputs: Awaited<ReturnType<typeof getSkuObject>>[] = []
      let groupSkuInputs: Awaited<ReturnType<typeof getGroupSkuObjects>> = []

      if (importAll) {
        // Full import: style SKUs from variants + group SKUs from font docs
        const [variants, fonts] = await Promise.all([
          getAllFontVariants(),
          getAllFonts(),
        ])

        if (!variants?.length) {
          return NextResponse.json({
            status: 400,
            now: Date.now(),
            message: 'No variants found for import',
          })
        }

        styleSkuInputs = await Promise.all(
          variants.map((variant) => getSkuObject(variant))
        )

        // Generate group SKUs from font documents
        const groupArrays = await Promise.all(
          fonts.map((font) => getGroupSkuObjects(font))
        )
        groupSkuInputs = groupArrays.flat()
      } else {
        // Webhook mode: style SKUs from payload variants
        styleSkuInputs = await Promise.all(
          body.variants.map((variant) => getSkuObject(variant))
        )

        // If webhook includes font-level data, also generate group SKUs
        if (body._id && body.uid && (body.styleGroups || body.variants)) {
          groupSkuInputs = await getGroupSkuObjects(body)
        }
      }

      // Import style SKUs
      if (styleSkuInputs.length) {
        await jsonImport('skus', styleSkuInputs)
      }

      // Import group SKUs
      if (groupSkuInputs.length) {
        await jsonImport('skus', groupSkuInputs)
      }

      return NextResponse.json({
        status: 200,
        now: Date.now(),
        styleSkus: styleSkuInputs.length,
        groupSkus: groupSkuInputs.length,
      })
    } catch (error) {
      console.error(error)
      return NextResponse.json({
        status: 500,
        now: Date.now(),
        message: 'Internal server error',
      })
    }
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
}
