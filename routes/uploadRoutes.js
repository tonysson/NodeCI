const AWS = require('aws-sdk');
const keys = require('../config/keys');
const { v1: uuidv1 } = require('uuid');
const requireLogin = require('../middlewares/requireLogin');


const s3 = new AWS.S3({
    accessKeyId : keys.accessKeyId,
    secretAccessKey : keys.secretAccessKey,
    signatureVersion: 'v4',
    region: 'eu-west-3'
});

module.exports = app => {

    //generate aws presigned URL
    app.get('/api/upload', requireLogin, (req, res) => {

        const key = `${req.user.id}/${uuidv1()}.jpeg`

        s3.getSignedUrl('putObject' , {
            Bucket : 'my-first-test-s3-using',
            ContentType:'image/jpeg',
            Key: key
        }, (error , url) => {
            res.send({key , url});
        })
    })

};