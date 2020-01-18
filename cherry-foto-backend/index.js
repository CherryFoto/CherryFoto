const express = require('express')
const app = express()
const port = 3000

let image = 'image/path/here'
var Canvas = require('canvas');

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

/* Use this function and pass uri into it. Callback will be the different filters */
function getImageThenEdit(uri, callback) {
    var img = new Image();
    img.src = uri;
    $(img).load(function() { 
        callback(img); 
    })
}

function invertColors(img) {
    var canvas = new Canvas(800, 800);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
}
