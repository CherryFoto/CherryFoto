const fs = require('fs')
const express = require('express')
const multer = require('multer');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const upload = multer({ dest: __dirname + '/uploads/images' });

const app = express()
const port = 3000

const map = [invertColors, grayScale, sunset, cool]

app.use('/static', express.static(path.join(__dirname, 'public')))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.get('/image', (req, res) => {
    // console.log()
    res.sendFile(__dirname + '/uploads/images/' + req.query.filePath)
})

app.post('/upload', upload.single('photo'), (req, res) => {
    if (req.file) {
        res.json(req.file);
        getImageThenEdit(req.file.path, processPixels)
        return res.status(200);
    } else {
        return res.status(401).json({ error: 'Please provide an image' });
    }
});

/* Use this function and pass uri into it. Callback will be the different filters */
function getImageThenEdit(uri, callback) {
    loadImage(uri).then((img) => {
        callback(img)
    }).catch(function() {
        console.log("error")
    })
}

// Returns the exact same image
function duplicateImage(img) {
    var canvas = createCanvas(img.width, img.height)
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    writeEditedImage(canvas, img.src)
}

function processPixels(img) {
    const w = img.width;
    const h = img.height;
    var canvas = createCanvas(w, h);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);
    const pixels = imageData.data
    const numPixels = w * h

    const filterChosen = false;

    if (filterChosen) {
        map[0](pixels, numPixels)
    } else {
        map[getRandomNumber()](pixels, numPixels)
    }

    ctx.clearRect(0, 0, w, h)
    ctx.putImageData(imageData, 0, 0)
    writeEditedImage(canvas, img.src)
    console.log("Image successfully filtered!")
}

function invertColors(pixels, numPixels) {
    for (let i = 0; i < numPixels; i++) {
        pixels[i * 4] = 255 - pixels[i * 4]
        pixels[(i * 4) + 1] = 255 - pixels[(i * 4) + 1]
        pixels[(i * 4) + 2] = 255 - pixels[(i * 4) + 2]
    }
}

function grayScale(pixels, numPixels) {
    for (let i = 0; i < numPixels; i++) {
        const r = pixels[i * 4]
        const g = pixels[(i * 4) + 1]
        const b = pixels[(i * 4) + 2]
        const avg = (r + g + b) / 3
        pixels[i * 4] = avg
        pixels[(i * 4) + 1] = avg
        pixels[(i * 4) + 2] = avg
    }
}

function sunset(pixels, numPixels) {
    for (let i = 0; i< numPixels; i++) {
        var r = pixels[i * 4]
        var g = Math.max(pixels[(i * 4) + 1] - 30, 0)
        var b = Math.max(pixels[(i * 4) + 2] - 60, 0)
        pixels[i * 4] = r
        pixels[(i * 4) + 1] = g
        pixels[(i * 4) + 2] = b
    }
}

function cool(pixels, numPixels) {
    for (let i = 0; i< numPixels; i++) {
        var r = Math.max(pixels[i * 4] - 30, 0)
        var g = Math.max(pixels[(i * 4) + 1] - 5)
        var b = pixels[(i * 4) + 2]
        pixels[i * 4] = r
        pixels[(i * 4) + 1] = g
        pixels[(i * 4) + 2] = b
    }
}

function getRandomNumber() {
    return Math.floor(Math.random() * Math.floor(4))
}

function writeEditedImage(canvas, filename) {
    const editedFilenameArray = filename.split("/");
    const editedFilename = editedFilenameArray[editedFilenameArray.length - 1];
    const writeStream = fs.createWriteStream(
        path.resolve(__dirname, 'editedPhotos/' + editedFilename + '.jpg')
    )
    canvas.createJPEGStream().pipe(writeStream)
}
