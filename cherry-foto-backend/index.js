const fs = require('fs')
const express = require('express')
const multer = require('multer');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const upload = multer({ dest: __dirname + '/uploads/images' });

const app = express()
const port = 3000

const map = [invertColors, grayScale, sunset, cool, modulo]

app.use('/static', express.static(path.join(__dirname, 'public')))

app.listen(port, () => console.log(`CherryFoto listening on port ${port}!`))

app.get('/image', (req, res) => {
    initFolderIfAbsent('/uploads/images');
    res.sendFile(__dirname + '/uploads/images/' + req.query.filePath)
})

app.post('/upload', upload.single('photo'), (req, res) => {
    if (req.file) {
        res.json(req.file);
        initFolderIfAbsent('edited_photos');
        getImageThenEdit(req.file.path, processPixels)
        return res.status(200);
    } else {
        return res.status(401).json({ error: 'Please provide an image' });
    }
});


function initFolderIfAbsent(pathname) {
    const newPath = path.resolve(
        __dirname, pathname
    )
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath)
    }
}

function getImageThenEdit(uri, callback) {
    loadImage(uri).then((img) => {
        callback(img)
    }).catch(function() {
        console.log("Error filtering image")
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

    const filterChosen = true;

    if (filterChosen) {
        map[1](pixels, numPixels)
    } else {
        const numberOfFilters = map.length
        map[getRandomNumber(numberOfFilters)](pixels, numPixels)
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
        const r = pixels[i * 4]
        const g = Math.max(pixels[(i * 4) + 1] - 30, 0)
        const b = Math.max(pixels[(i * 4) + 2] - 60, 0)
        pixels[i * 4] = r
        pixels[(i * 4) + 1] = g
        pixels[(i * 4) + 2] = b
    }
}

function cool(pixels, numPixels) {
    for (let i = 0; i < numPixels; i++) {
        const r = Math.max(pixels[i * 4] - 30, 0)
        const g = Math.max(pixels[(i * 4) + 1] - 5)
        const b = pixels[(i * 4) + 2]
        pixels[i * 4] = r
        pixels[(i * 4) + 1] = g
        pixels[(i * 4) + 2] = b
    }
}

function modulo(pixels, numPixels) {
    for (let i = 0; i < numPixels; i++) {
        const r = Math.min(pixels[i * 4] + 50, 255)
        const g = Math.min(pixels[(i * 4) + 1] + 50, 255)
        const b = Math.max(pixels[(i * 4) + 2] - 50, 0)
        pixels[i * 4] = r
        pixels[(i * 4) + 1] = g
        pixels[(i * 4) + 2] = b
    }
}

function getRandomNumber(numberOfFilters) {
    return Math.floor(Math.random() * Math.floor(numberOfFilters))
}

function writeEditedImage(canvas, filename) {
    const editedFilename = path.basename(filename)
    const d = new Date();
    var newFilename = d.getDate() + "-"
    newFilename += (d.getMonth() + 1) + "-"
    newFilename += d.getFullYear() + "\ "
    newFilename += d.getHours() + "." + d.getMinutes() + "." + d.getSeconds()
    newFilename += '.jpg'
    const writeStream = fs.createWriteStream(
        path.resolve(__dirname, 'edited_photos/' + newFilename)
    )
    canvas.createJPEGStream().pipe(writeStream)
}
