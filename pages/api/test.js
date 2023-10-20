import { fontVariantsQuery } from 'lib/sanity.queries'

import { getFontOrVariantWithOrTypeInstance } from 'lib/sanity.client'
import { cacheFlush } from 'lib/utils/cache'

export default async function test(req, res) {
  cacheFlush()
  const sanityFontVariants = await getFontOrVariantWithOrTypeInstance(
    fontVariantsQuery
  )
  console.log(
    'get width of word "ortype" at font-size 12px',
    sanityFontVariants?.map((variant) => {
      return variant?.name + ': ' + variant?.orType?.getWordWidth('ortype', 12)
    })
  )

  /*
  const test = await getFontOrVariantWithOrTypeInstance('*[_type == $type && uid == $uid][0]', {
    type: 'font',
    uid: 'Rather v2',
  })
  console.log('ortype', test._id)
  */
  res.end()
}
