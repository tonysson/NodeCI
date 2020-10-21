/**
 * @description this file allow us to tell our tests to be connected to mongoose when neccessary
 * otherwise when we run our test it does not conected to our server side code
 * 
 * before jest load this file we have to make a config in our package.json
 */

jest.setTimeout(500000);


require('../models/User')
const mongoose  = require('mongoose')
const keys = require('../config/keys')

// we are telling mongoose to use NODEJS GLOBAL PROMISE
mongoose.Promise = global.Promise;
//connect to mongoose
mongoose.connect(keys.mongoURI,{useMongoClient:true})
