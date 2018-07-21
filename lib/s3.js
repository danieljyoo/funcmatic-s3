'use strict';

class S3 {
  constructor(s3, config) {
    this.s3 = s3
    this.config = config
    this.Bucket = config.Bucket 
    this.ResponseContentType = config.ResponseContentType
  }
  
  s3Params(options) {
    var params = {
      Bucket: options.Bucket || this.Bucket
    }
    return params
  }
  
  get(key, options) {
    options = options || { }
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: options.Bucket || this.Bucket,
        Key: key
      }
      this.s3.getObject(params, function(err, data) {
        if (err) {
          reject(err)
          return
        }
        resolve(data.Body.toString('utf-8'))
        return
      })
    })
  }

  put(key, body, options) {
    options = options || { }
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: options.Bucket || this.Bucket,
        Key: key,
        Body: body
      }
      this.s3.putObject(params, function(err, data) {
        if (err) {
          reject(err)
          return
        }
        resolve(data)
        return
      })
    })
  }
  
  getSignedPutUrl(key, options) {
    options = options || { }
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: options.Bucket || this.Bucket,
        Key: key
      }
      this.s3.getSignedUrl('putObject', params, function (err, url) {
        if (err) {
          reject(err)
          return
        }
        resolve({
          bucket: params.Bucket, 
          key: params.Key, 
          url 
        })
        return
      })
    })
  }

  /*
    [ { Key: 'test.json' } ], Errors: [ ] }
  */
  delete(keys, options) {
    options = options || { }
    if (typeof keys == 'string') {
      keys = [ keys ]
    }
    var objects = [ ]
    for (var i=0; i<keys.length; i++) {
      objects.push({
        Key: keys[i]
      })
    }
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: options.Bucket || this.Bucket,
        Delete: {
          Objects: objects
        }
      }
      this.s3.deleteObjects(params, function(err, data) {
        if (err) {
          reject(err)
          return
        }
        var keys = [ ]
        for (var i=0; i<data.Deleted.length; i++) {
          keys.push(data.Deleted[i].Key)
        }
        data.keys = keys
        resolve(data)
        return
      })
    }) 
  }
  
  /*
  data = {
  Contents: [
     {
    ETag: "\"70ee1738b6b21e2c8a43f3a5ab0eee71\"", 
    Key: "happyface.jpg", 
    LastModified: <Date Representation>, 
    Size: 11, 
    StorageClass: "STANDARD"
   }, 
     {
    ETag: "\"becf17f89c30367a9a44495d62ed521a-1\"", 
    Key: "test.jpg", 
    LastModified: <Date Representation>, 
    Size: 4192256, 
    StorageClass: "STANDARD"
   }
  ], 
  IsTruncated: true, 
  KeyCount: 2, 
  MaxKeys: 2, 
  Name: "examplebucket", 
  NextContinuationToken: "1w41l63U0xa8q7smH50vCxyTQqdxo69O3EmK28Bi5PcROI4wI/EyIJg==", 
  Prefix: ""
  }
  */
  list(prefix, options) {
    options = options || { }
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: options.Bucket || this.Bucket
      }
      if (prefix) {
        params.Prefix = prefix
      }
      this.s3.listObjectsV2(params, function(err, data) {
        if (err) {
          reject(err)
          return
        }
        var keys = [ ]
        for (var i=0; i<data.Contents.length; i++) {
          keys.push(data.Contents[i].Key)  
        }
        data.keys = keys
        resolve(data)
        return
      })
    })
  }
  
  /*
   { CopyObjectResult: 
       { ETag: '"fbc24bcc7a1794758fc1327fcfebdaf6"',
         LastModified: Thu Dec 07 2017 16:02:12 GMT+0000 (UTC) } }
  */
  copy(srckey, dstkey, options) {
    options = options || { }
    var SrcBucket = options.SrcBucket || this.Bucket
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: options.Bucket || this.Bucket,
        CopySource: `/${SrcBucket}/${srckey}`,
        Key: dstkey
      }
      this.s3.copyObject(params, function(err, data) {
          if (err) {
            reject(err)
            return
          }
          resolve(data)
          return
        })
      })
    }
  }


function create(s3, config) {
  return new S3(s3, config)
}

module.exports = create
