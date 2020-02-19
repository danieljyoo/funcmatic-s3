'use strict'
const fs = require('fs')
const axios = require('axios')

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

const uuidV4= require('uuid')

const s3 = require('../lib/s3')(new AWS.S3(), {
  Bucket: "test.funcmatic.com"
})

describe('Basic S3 Operations', () => {
  it ('should upload and get a file from S3', async () => {
    var data = await s3.put("test.json", JSON.stringify({ "hello": "world" }))
    expect(data).toMatchObject({
      ETag: expect.anything()
    })
    data = await s3.get("test.json")
    var json = JSON.parse(data)
    expect(json).toMatchObject({
      hello: 'world'
    })
    data = await s3.copy("test.json", "test2.json")
    expect(data).toHaveProperty('CopyObjectResult.ETag')
    data = await s3.list("test")
    expect(data).toHaveProperty('KeyCount', 2)
    expect(data).toHaveProperty('Contents')
    expect(data.Contents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Key: "test.json",
        }),
        expect.objectContaining({
          Key: "test2.json"
        })
      ])
    )
    data = await s3.delete(data.keys)
    expect(data).toHaveProperty('keys')
    console.log(data.keys)
    expect(data.keys.sort()).toEqual([ "test.json", "test2.json" ])
  }, 30000)
  it ('should get a presigned url to put object', async () => {
    var signed = await s3.getSignedPutUrl("test.json", { 'ContentType': 'application/json' })
    console.log(signed)
    var res = (await axios.put(signed.url, `{"hello":"world"}`, { headers: { 'Content-Type': 'application/json' }})).data
    console.log(res)
  })
  it ('should upload a presigned url for a zip object (non-streaming)', async () => {
    var path = `${__dirname}/index.test.zip`
    var size = fs.statSync(path).size
    // var signed = await s3.getSignedPutUrl('index.test.zip', { 
    //   'ContentType': 'application/zip'
    // })
    var signed = await s3.getSignedPutUrl('users/0edb3176-e3d9-45ac-8a26-b6d43cb1f6d1/functions/a2a3a9d4-a1f2-47d3-b123-72e47cff933e/index.test.zip', { 
      'ContentType': 'application/zip'
    })

    var res = (await axios.put(signed.url, 
      //fs.createReadStream(path), { 
        fs.readFileSync(path), { 
        headers: { 
          'Content-Type': 'application/zip'
        }
      })).data
    console.log(res)
  })
})


