import sanityClient from '@sanity/client'

export default class Sanity extends sanityClient {

  constructor() {
    super({
      projectId: process.env.SANITY_API_PROJECT_ID,
      dataset: process.env.SANITY_API_DATASET,
      apiVersion: '2021-03-25', // use current UTC date - see "specifying API version"!
      token: process.env.SANITY_API_WRITE_TOKEN, // or leave blank for unauthenticated usage
      useCdn: false, // `false` if you want to ensure fresh data
    });
  }

  static async getInstance() {
    const object = new this()
    return await object.init()
  }

  async init(){
    return this
  }

  /**
   * @param uid
   * @returns {Promise<any>}
   */
  async findByUid(uid){
    return this.fetch('*[_type == $type && uid == $uid][0]',{
      type: 'product',
      uid
    })
  }

  /**
   * @param uid
   * @param version
   * @returns {Promise<any>}
   */
  async findByUidAndVersion(uid, version){
    return this.fetch('*[_type == $type && uid == $uid && version == $version][0]',{
      type: 'product',
      uid,
      version
    })
  }
}
