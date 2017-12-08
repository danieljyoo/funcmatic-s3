'use strict'

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

const uuidV4= require('uuid')

const s3 = require('../lib/s3')(new AWS.S3(), {
  Bucket: "test.funcmatic.com"
})

describe('Basic S3 Operations', () => {
  it ('should upload and get a file from S3', done => {
    s3.put("test.json", JSON.stringify({ "hello": "world" }))
    .then((data) => {
      expect(data).toMatchObject({
        ETag: expect.anything()
      })
      return s3.get("test.json")
    })
    .then((data) => {
      var json = JSON.parse(data)
      expect(json).toMatchObject({
        hello: 'world'
      })
      return s3.copy("test.json", "test2.json")
    })
    .then((data) => {
      console.log(data)
      expect(data).toHaveProperty('CopyObjectResult.ETag')
      return s3.list("test")
    })
    .then((data) => {
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
      return s3.delete(data.keys)
    })
    .then((data) => {
      console.log(data)
      expect(data).toHaveProperty('keys')
      expect(data.keys).toEqual(
        expect.arrayContaining([ "test.json", "test2.json" ])
      )
      done()
    })
  })
})


