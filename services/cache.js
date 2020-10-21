const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util') // to access promisify
const colors = require('colors');
const keys = require('../config/keys');


//IMPORTANT: The exec function return a mongoose document

//redis Url
// const redisUrl = 'redis://127.0.0.1:6379'


//redis client
const client = redis.createClient(keys.redisUrl)

//promisify our client.hget function
client.hget = util.promisify(client.hget);


// store a refence to the original exec function , untouch copy of it
const exec = mongoose.Query.prototype.exec ; 

/**
 * @description we want to create a function that we'll give us the posibility to cache or not a query
 * cf blogRoutes to see the target routes with cache or not  ex : Blog.find({}).limit().sort().cache()
 * we want to spcefify on the fly in a more dynamic way that top level key instead of using userId
 * hashedKey must be a number or a string so we use JSON.stringify()
 * @param {options} options 
 */

mongoose.Query.prototype.cache = function(options = {}){

     // to make sure that we chaine cache on those query we want the cache function to be executed we have to return this 

    this.useCache = true
    this.hashedKey = JSON.stringify(options.key || '')
   
    return this

}

/**
 * @description  code that will run before any query is executed by mongoose
 *  we're rewriting the exec function in mongoose
 */
mongoose.Query.prototype.exec = async function () {

    // if we do not have the cache function on a specif query we just return the normal exec function , not the one we create above
    if(!this.useCache){
        return await exec.apply(this, arguments)
    }

 console.log(`IM ABOUT TO RUN A QUERY`.red.bold)
    // console.log(this.getQuery()); give us the all the query which were run 
    // console.log(this.mongooseCollection.name); gives us the collection name of each query

    //Object.assign is used to safely copy property from one object to another
 const key=JSON.stringify( Object.assign({}, this.getQuery() , {collection: this.mongooseCollection.name}))
  //console.log(key);

  //See if we have a value for 'key' in redis
  const cacheValue = await client.hget(this.hashedKey , key)

  //if we have return it
  if(cacheValue){

    //we have to return a mongoose document do we parse it
    //this.model is a reference to the model that the query is attached to
    // new this.model(doc) = it is the same thing we write new Blog({title: 'hi' , content : 'im a content'})

    const doc = JSON.parse(cacheValue)

    //Sommetimes we could get a user with a single post or a user with arrays of post , so we have to check for it
   return  Array.isArray(doc) 
            ? doc.map(d => new this.model(d))
            : new this.model(doc)
  }

  //Otherwise , issue the query and store the result in redis
   const result = await exec.apply(this, arguments) // this return  mongoose document

   //store it in redis
   client.hset(this.hashedKey, key , JSON.stringify(result))

   return result 
}


module.exports = {

    /**
     * @description allow us to clear a key
     * @param {the hash key} hashkey 
     */
    clearHash(hashkey){
        client.del(JSON.stringify(hashkey))
    }
}




