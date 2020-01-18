const fs = require('fs')
const express = require('express')
const multer = require('multer');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const upload = multer({ dest: __dirname + '/uploads/images' });

const app = express()
const port = 3000

const map = [invertColors, grayScale, sunset, cool, cartoon]

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
        map[4](pixels, numPixels)
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

function getModelPixels() {
    const red1 = [245, 78, 41];
    const red2 = [186, 57, 32];
    const red3 = [99, 31, 17];
    const orange1 = [255, 149, 43];
    const orange2 = [171, 100, 29];
    const orange3 = [110, 64, 19];
    const green1 = [176, 255, 66];
    const green2 = [127, 184, 48];
    const green3 = [76, 110, 29];
    const green4 = [13, 128, 0];
    const blue1 = [0, 166, 235];
    const blue2 = [2, 118, 168];
    const blue3 = [0, 66, 94];
    const blue4 = [0, 80, 156];
    const yellow1 = [255, 183, 49];
    const yellow2 = [181, 130, 34];
    const yellow3 = [107, 77, 20];
    const brown1 = [355, 199, 94];
    const brown2 = [189, 147, 70];
    const brown3 = [133, 186, 7];
    const black = [0, 0, 0];
    const gray = [59, 59, 59];
    const white = [255, 255, 255];
    let modelPixels = [
        red1, 
        red2, 
        red3, 
        orange1, 
        orange2, 
        orange3, 
        green1, 
        green2, 
        green3, 
        green4, 
        blue1, 
        blue2, 
        blue3, 
        blue4, 
        yellow1, 
        yellow2, 
        yellow3, 
        brown1,
        brown2,
        brown3,
        black, 
        gray,
        white, 
    ];
    return modelPixels
}

function cartoon(pixels, numPixels) {
    let modelPixels = getModelPixels()
    for (let i = 0; i < numPixels; i++) {
        const r = pixels[i * 4];
        const g = pixels[(i * 4) + 1];
        const b = pixels[(i * 4) + 2];
        const currentPixel = [r, g, b];
        const distances = modelPixels.map(model => distanceTo(model, currentPixel));
        const floorPixel = getFloorPixelIndex(distances)
        pixels[i * 4] = modelPixels[floorPixel][0];
        pixels[(i * 4) + 1] = modelPixels[floorPixel][1];
        pixels[(i * 4) + 2] = modelPixels[floorPixel][2];
    }
}

function getFloorPixelIndex(distances) {
    return distances.indexOf(Math.min.apply(null, distances));
}

function distanceTo(pixel, model) {
    let a = pixel[0] - model[0]
    a = a * a
    let b = pixel[1] - model[1]
    b = b * b
    let c = pixel[2] - model[2]
    c = c * c
    return a + b + c
}

function getRandomNumber(numberOfFilters) {
    return Math.floor(Math.random() * Math.floor(numberOfFilters))
}

function writeEditedImage(canvas, filename) {
    const editedFilename = path.basename(filename)
    const writeStream = fs.createWriteStream(
        path.resolve(__dirname, 'edited_photos/' + getNewFilename())
    )
    canvas.createJPEGStream().pipe(writeStream)
}

function getNewFilename() {
    const d = new Date();
    var newFilename = d.getDate() + "-"
    newFilename += (d.getMonth() + 1) + "-"
    newFilename += d.getFullYear() + "\ "
    newFilename += d.getHours() + "." + d.getMinutes() + "." + d.getSeconds()
    newFilename += '.jpg'
    return newFilename
}
