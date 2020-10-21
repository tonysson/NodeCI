const {clearHash} = require('../services/cache');


/**
 * @description When inserting a middleware in a function it runs before the function
 * But in our case we want the blog to be created and after we clear the cache because we dont want to clear our cache if we do not insure that the blog was created
 * To resolve it , we tag the function of async and wr run next before running our clearHash
 * It will allowed the route handler to be executed first (post creation) and after we run clearHash
 * @param {request} req 
 * @param {response} res 
 * @param {next} next 
 */

module.exports = async (req, res , next) => {
   await next()
   clearHash(req.user.id)
    
}