// Ports the transform previously done by ortype-graphql-api's
// `Query.webfonts` resolver, but reads Sanity's `fontVariant.metafields`
// directly instead of proxying through the GraphQL API.
import type { WebfontsQueryResult } from '@/types'
import { compactArray } from './normalize'

/*
Note: compactArray's existing signature:
((T | null)[] | null | undefined) => T[]) 
— double check it accepts the generic param the way I called 
it (compactArray<RawMetafield>(metafields)) once you have 
the real WebfontsQueryResult shape from pn typegen; adjust 
the generics/nullability if typegen's shape differs.
*/

type RawVariant = NonNullable<WebfontsQueryResult>[number]
type RawMetafield = NonNullable<RawVariant['metafields']>[number]

export interface Webfont {
  classId: string
  fontFamily?: string
  fontFamilyVariable?: string
  woff?: string
  woff2?: string
  vf?: string
  fontVariationSettings?: string
}

function getMetaValue(
  metafields: RawVariant['metafields'],
  key: string,
): string | undefined {
  const value = compactArray<RawMetafield>(metafields).find(
    (meta) => meta?.key === key,
  )?.value
  if (!value) return undefined
  // Font files are stored as `public/...` paths served by the GraphQL API's
  // static file server; rewrite to the public API URL.
  return value.includes('public')
    ? value.replace('public', process.env.NEXT_PUBLIC_API_URL ?? '')
    : value
}

function filenameWithoutExtension(filePath: string | undefined) {
  return filePath
    ?.split('/')
    .pop()
    ?.replace(/\.[^./]+$/, '')
}

function cssSafeClassId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, '-')
}

export function toWebfonts(
  variants: WebfontsQueryResult | null | undefined,
): Webfont[] {
  return compactArray<RawVariant>(variants).map((variant) => {
    const { metafields } = variant
    const woff = getMetaValue(metafields, 'woff')
    const woff2 = getMetaValue(metafields, 'woff2')
    const otf = getMetaValue(metafields, 'otf')
    const vf = getMetaValue(metafields, 'familyFile')
    const axesCount = Number(getMetaValue(metafields, 'axesCount'))
    const isVariable = Number.isFinite(axesCount) && axesCount > 0

    let fontVariationSettings: string | undefined
    if (isVariable) {
      for (let itr = 1; itr <= axesCount; itr += 1) {
        const axesKey = getMetaValue(metafields, `axes${itr}`)
        const axesValue = axesKey && getMetaValue(metafields, axesKey)
        if (!axesKey || !axesValue) continue
        fontVariationSettings = fontVariationSettings
          ? `${fontVariationSettings}, "${axesKey}" ${axesValue}`
          : `"${axesKey}" ${axesValue}`
      }
    }

    return {
      classId: cssSafeClassId(variant._id),
      fontFamily: filenameWithoutExtension(otf),
      fontFamilyVariable: isVariable ? filenameWithoutExtension(vf) : undefined,
      woff,
      woff2,
      vf,
      fontVariationSettings,
    }
  })
}
