import sanityFetch from '../../lib/utils/sanity.fetch'

export default async function test(req, res) {
  const test = await sanityFetch('*[_type == $type && uid == $uid][0]', {
    type: 'font',
    uid: 'Rather v2'
  })
  console.log('ortype', test._id)
  res.end()
}
