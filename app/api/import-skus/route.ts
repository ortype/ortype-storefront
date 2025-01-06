import { NextRequest, NextResponse } from 'next/server'
import { getSkuObject, jsonImport } from '@/commercelayer/utils/import'
import { getAllFontVariants } from '@/lib/sanity.client'
import { parseBody } from "next-sanity/webhook"

export async function POST(
  req: NextRequest,
  res: NextResponse
) {

  const importAll = false
  if (importAll) console.log('IMPORT ALL!!!') 
  // @NOTE: hitting the api route directly at http://localhost:8000/api/import-skus
  // doesn't seem to run my importAll flagged condition (getting 405 error)

  try {

    const { body, isValidSignature } = await parseBody<{
      _type: string;
      slug?: string | undefined;
    }>(req, process.env.SANITY_WEBHOOK_SECRET);

    if (!isValidSignature && !importAll) {
      return new Response("Invalid Signature", { status: 401 });
    }
    
    if (!body?.variants) {
      return new Response("Payload is missing variants", { status: 400 });
    }

    let inputs

    try {
      if (importAll) { // @NOTE: 1-off import ONLY!!
        const variants = await getAllFontVariants()
        if (!variants) {
          return NextResponse.json({
            status: 400,
            now: Date.now(),
            message: 'Payload is missing variants',
          })  
        }      
        inputs = await Promise.all(variants.map(variant => getSkuObject(variant)))
      } else {
        inputs = await Promise.all(body.variants.map(variant => getSkuObject(variant)))
      }

      await jsonImport('skus', inputs)
        return NextResponse.json({
        status: 200,
        now: Date.now(),
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
    console.error(error);
    return new Response(error.message, { status: 500 });
  }    
 
}
