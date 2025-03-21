const fs = require('fs'),
    { S3Client } = require('@aws-sdk/client-s3'),
    { Upload } = require('@aws-sdk/lib-storage'),
    request = require('request'),
    stream = require('stream'),
    path = require("path"),
    FormData = require('form-data'),
    axios = require('axios').default,
    keystore = require('../configurations/keystore.js'),
    config = require("../configurations/config.js"),
    bucket = process.env.BUCKET || config.s3Bucket;

const s3 = new S3Client({
    region: keystore.aws_region,
    credentials: {
        secretAccessKey: keystore.s3_secretAccessKey,
        accessKeyId: keystore.s3_accessKeyId
    }
});

const FileContentType = {
    'png': 'image/png',
    'pdf': 'application/pdf',
    'svg': 'image/svg+xml',
    'jpg': 'image/jpeg',
    'video': 'video/mp4'
}

async function downloadFileByUrl(params) {
    if (!fs.existsSync(params.DestFolder)) {
        fs.mkdirSync(params.DestFolder);
    }
    let ws = fs.createWriteStream(params.Filepath),
        stream = request(params.Url).pipe(ws);
    return new Promise((resolve, reject) => {
        stream.on('close', () => {
            resolve(true);
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
}

function uploadS3Stream({Bucket, Key, FileType}) {
    let pass = new stream.PassThrough();
    return {
        writeStream: pass,
        s3Upload: new Upload({
            client: s3,
            params: {
                Bucket, Key,
                Body: pass,
                ContentType: FileContentType[FileType]
            }
        })
    };
}

async function requestUrlAndUploadToS3(params) {
    let { writeStream, s3Upload } = uploadS3Stream({Bucket: params.CustomBucket || bucket, Key: params.FileName, FileType: params.FileType}),
        stream = request(params.Url).pipe(writeStream);
    try {
        let upload = await s3Upload.done();
        return upload.Location;
    } catch (error) {
        console.log('upload failed.', error.message);
    }
}

async function readFileAndUploadToS3(params) {
    let tmpFile = params.FilePath,
        uploadFileName = params.FileName || params.FilePath,
        { writeStream, s3Upload } = uploadS3Stream({
            Bucket: params.CustomBucket || bucket,
            Key: uploadFileName,
            FileType: params.FileType
        }),
        stream = fs.createReadStream(tmpFile).pipe(writeStream);
    try {
        let upload = await s3Upload.done();
        console.log('readFileAndUploadToS3', upload.Location);
        return upload.Location;
    } catch (error) {
        console.log('upload failed.', error.message);
    }
}

module.exports = {
    DownloadFileByUrl: downloadFileByUrl,
    RequestUrlAndUploadToS3: requestUrlAndUploadToS3,
    ReadFileAndUploadToS3: readFileAndUploadToS3
}