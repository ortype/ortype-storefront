import sanityFetch from '../../lib/utils/sanity.fetch'
import { fontVariantsQuery } from '../../lib/sanity.queries'

export default async function test(req, res) {
  /*
  const sanityFontVariants = await sanityFetch(fontVariantsQuery)
  console.log(
    'get width of word "ortype" at font-size 12px',
    sanityFontVariants.map((variant) => {
      return variant?.name + ': ' + variant?.ortype?.getWordWidth('ortype', 12)
    })
  )
  */

  /*
  const test = await sanityFetch('*[_type == $type && uid == $uid][0]', {
    type: 'font',
    uid: 'Rather v2',
  })
  console.log('ortype', test._id)
  */
  res.end()
}
