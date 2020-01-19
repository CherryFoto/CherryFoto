const fs = require("fs");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const upload = multer({ dest: __dirname + "/uploads/images" });

const app = express();
const port = 3001;

const filters = {
  invert: invertColors,
  grayscale: grayScale,
  sunset: sunset,
  cool: cool,
  wonky: wonky
};

const filtersArray = [
    invertColors,
    grayScale,
    sunset,
    cool,
    wonky,
]

app.use("/static", express.static(path.join(__dirname, "public")));

app.use(cors());

app.listen(port, () => console.log(`CherryFoto listening on port ${port}!`));

app.get("/image", (req, res) => {
  initFolderIfAbsent("/uploads/images");
  res.sendFile(
    getFilePath(req.query.filename, "/uploads/images/", function(err) {
      console.log("Error with sending link");
    })
  );
});

app.get("/filteredImage", (req, res) => {
  initFolderIfAbsent("edited_photos");
  res.sendFile(
    getFilePath(req.query.filename, "/edited_photos", function(err) {
      console.log("Error with sending link");
    })
  );
});

app.get("/downloadFilteredImage", (req, res) => {
  initFolderIfAbsent("edited_photos");
  res.download(
    getFilePath(req.query.filename, "/edited_photos", function(err) {
      console.log("Error with sending link");
    })
  );
});

app.post("/upload", upload.single("photo"), (req, res) => {
  if (req.file) {
    res.json(req.file);
    return res.status(200);
  } else {
    return res.status(401).json({ error: "Please provide an image" });
  }
});

app.get("/filterImageLink", async (req, res) => {
  let filePath = getFilePath(req.query.filename, "/uploads/images/");
  let filterChosen = req.query.filter;
  console.log(filterChosen);

  let fp = await getImageThenEdit(filePath, processPixels, filterChosen);
  res.send(fp);
});

function getFilePath(filename, folder) {
  return path.join(__dirname, folder, filename);
}

function initFolderIfAbsent(pathname) {
  const newPath = path.join(__dirname, pathname);
  if (!fs.existsSync(newPath)) {
    fs.mkdirSync(newPath);
  }
}

async function getImageThenEdit(uri, callback, filterChosen) {
  try {
    let img = await loadImage(uri);
    return callback(img, filterChosen);
  } catch (err) {
    console.log(err);
  }
}

function processPixels(img, filterChosen) {
    const w = img.width;
    const h = img.height;
    var canvas = createCanvas(w, h);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);
    const pixels = imageData.data;
    const numPixels = w * h;

    const isRandom = filterChosen == 'random';
    const isReset = filterChosen == 'reset';

    if (isRandom) {
        const numberOfFilters = filtersArray.length;
        filtersArray[getRandomNumber(numberOfFilters)](pixels, numPixels);
    } else if (!isReset) {
        filters[filterChosen](pixels, numPixels, w, h);
    }

    ctx.clearRect(0, 0, w, h);
    ctx.putImageData(imageData, 0, 0);
    let editedImageFilePath = writeEditedImage(canvas, img.src);
    console.log("Image successfully filtered!");
    return editedImageFilePath;
}

function invertColors(pixels, numPixels, w, h) {
  for (let i = 0; i < numPixels; i++) {
    pixels[i * 4] = 255 - pixels[i * 4];
    pixels[i * 4 + 1] = 255 - pixels[i * 4 + 1];
    pixels[i * 4 + 2] = 255 - pixels[i * 4 + 2];
  }
}

function grayScale(pixels, numPixels, w, h) {
  for (let i = 0; i < numPixels; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    const avg = (r + g + b) / 3;
    pixels[i * 4] = avg;
    pixels[i * 4 + 1] = avg;
    pixels[i * 4 + 2] = avg;
  }
}

function sunset(pixels, numPixels, w, h) {
  for (let i = 0; i < numPixels; i++) {
    const r = pixels[i * 4];
    const g = Math.max(pixels[i * 4 + 1] - 30, 0);
    const b = Math.max(pixels[i * 4 + 2] - 60, 0);
    pixels[i * 4] = r;
    pixels[i * 4 + 1] = g;
    pixels[i * 4 + 2] = b;
  }
}

function cool(pixels, numPixels, w, h) {
  for (let i = 0; i < numPixels; i++) {
    const r = Math.max(pixels[i * 4] - 30, 0);
    const g = Math.max(pixels[i * 4 + 1] - 5);
    const b = pixels[i * 4 + 2];
    pixels[i * 4] = r;
    pixels[i * 4 + 1] = g;
    pixels[i * 4 + 2] = b;
  }
}

function wonky(pixels, numPixels, w, h) {
  const factor = 30;
  const colored = w / factor;
  var widthThickness = Math.floor(w / 200);
  var heightThickness = Math.floor(h / 200);
  widthThickness = Math.max(widthThickness, heightThickness);
  heightThickness = Math.max(widthThickness, heightThickness);
  for (let i = 0; i < numPixels; i++) {
    const rowValue = Math.floor((i / w) % (h / factor));
    if (i % colored < widthThickness) {
      continue;
    }
    if (rowValue < heightThickness) {
      continue;
    }
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    const avg = (r + g + b) / 3;
    pixels[i * 4] = avg;
    pixels[i * 4 + 1] = avg;
    pixels[i * 4 + 2] = avg;
  }
}

function getRandomNumber(numberOfFilters) {
  return Math.floor(Math.random() * Math.floor(numberOfFilters));
}

function writeEditedImage(canvas, filename) {
  initFolderIfAbsent("edited_photos");
  const editedFilename = path.basename(filename);
  const d = new Date();
  var newFilename = d.getDate() + "-";
  newFilename += d.getMonth() + 1 + "-";
  newFilename += d.getFullYear() + " ";
  newFilename += d.getHours() + "." + d.getMinutes() + "." + d.getSeconds();
  newFilename += ".jpg";
  let newFilePath = path.join(__dirname, "edited_photos/" + newFilename);
  const writeStream = fs.createWriteStream(newFilePath);
  canvas.createJPEGStream().pipe(writeStream);
  return newFilename;
}
