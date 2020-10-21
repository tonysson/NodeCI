const Buffer = require('safe-buffer').Buffer
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey])


/**
 * @description create a session and a sig
 * @param {user} user 
 * @returns session and sig
 */
module.exports = (user) => {
    //generate a fake session object with it
     const sessionObject = {
        passport: {
            user: user._id.toString()
        }
    }
    // turn the sessionObject into a string
    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');

    //We now use keygrip to generate the signature for it
    const sig = keygrip.sign('session=' + session)

    return {session , sig }
}