const NodeCache = require( "node-cache" );
const myCache = new NodeCache();


class questionCache {
    cache: any;
  static getStoredUserInfoByID: any;

    constructor() {
      // this.cache = new NodeCache()
      this.cache = new NodeCache({ stdTTL: 0, checkperiod:0, useClones: false });
    }
    storeByID(key, result) {
     const store =  this.cache.set(key, result);
      // this.cache.mset({key: key, val: result});
    }

    getStoredCacheByID(key) {
      const res = this.cache.get(key);
      return res
    }


  /*   takeStoredUserInfo(key) {
      //take gets the cache and deletes it . equal to get(key) + del(key)
      const res = this.cache.take(key);
      return res
    } */
}
export default questionCache;