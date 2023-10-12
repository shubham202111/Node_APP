const express = require("express");
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express()
app.use(express.json())
app.use(cors())

const bucketDirectory = 'Test-directory';
if (!fs.existsSync(bucketDirectory)) {
    fs.mkdirSync(bucketDirectory);
    console.log(`Created bucket directory: ${bucketDirectory}`);
}

//Create Bucket
app.post('/v1/createBucket', (req, res) => {
    const bucketName = req.body.bucketName;
    const newBucketDirectory = path.join(bucketDirectory, bucketName);
    if (!fs.existsSync(newBucketDirectory)) {
        fs.mkdirSync(newBucketDirectory);

        res.json({ statusCode: 200, message: 'Bucket Created' })
    } else {

        res.json({ statusCode: 409, message: 'Bucket already exists' })
    }
})

//list bucket
app.get('/v1/listBuckets', (req, res) => {
    const bucketList = [];
    const parentDirectory = path.resolve(bucketDirectory, './');

    const directories = fs.readdirSync(parentDirectory);
    directories.forEach(directory => {
        bucketList.push(directory)
    });
    if (directories.length <= 0) {
        res.json({ statusCode: 404, message: 'Not exist any bucket' })
    }
    res.json({ statusCode: 200, message: 'Fetch Bucket List', data: bucketList })
})

//list object
app.get('/v1/listObject/:bucketName', (req, res) => {
    const bucketFile = [];
    const bucketName = req.params.bucketName;
    const bucketPath = path.join(bucketDirectory, bucketName);
    if (fs.existsSync(bucketPath)) {
        const files = fs.readdirSync(bucketPath);
        if (files.length <= 0) {
            res.json({ statusCode: 404, message: 'Not Found' })
        }else{
        files.forEach(file => {
            bucketFile.push(file)
        });
        
        res.json({ statusCode: 200, message: 'List Object', data: bucketFile })
    }
    } else {
        res.json({ statusCode: 400, message: 'Bucket not exists' })
    }
})

//Put Object
app.post('/v1/putObject', (req, res) => {
    const bucketName = req.body.bucketname;
    const bucketPath = path.join(bucketDirectory, bucketName);
    if (!fs.existsSync(bucketPath)) {
        res.json({ statusCode: 404, message: 'Bucket does not exist' })
    } else {
        const objectPath = path.join(bucketPath, req.body.objectName);
        fs.writeFileSync(objectPath, req.body.data);
        res.json({ statusCode: 200, message: "Updated Object" })
    }
})

//Get object
app.get('/v1/getObject/:bucketName/:objectName', (req, res) => {
    const objectPath = path.join(bucketDirectory, req.params.bucketName, req.params.objectName);
    if (fs.existsSync(objectPath)) {
        const data = fs.readFileSync(objectPath, 'utf8');
        res.json({ statusCode: 200, message: "Get Object data", result: data })
    } else {
        res.json({ statusCode: 404, message: `Object ${req.params.objectName} does not exist in bucket ${req.params.bucketName}` })
    }
})

//Delete Object
app.delete('/v1/deleteObject/:bucketName/:objectName', (req, res) => {
    const objectPath = path.join(bucketDirectory, req.params.bucketName, req.params.objectName);
    if (fs.existsSync(objectPath)) {
        fs.unlinkSync(objectPath);

        res.json({ statusCode: 200, message: `Object ${req.params.objectName} deleted from bucket ${req.params.bucketName}` })
    } else {
        res.json({ statusCode: 404, message: `Object ${req.params.objectName} does not exist in bucket ${req.params.bucketName}` })
    }
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running up at port ${port}`)
})