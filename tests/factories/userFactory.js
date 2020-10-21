const mongoose = require('mongoose')
const User = mongoose.model('User')

/**
 * @description create a new user
 * @returns a promise && user , and save it 
 */

module.exports =  () => {
    return new User({}).save()
}