const express = require('express')
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: __dirname + '/uploads/images' });

const app = express()
const port = 3000

app.use('/static', express.static(path.join(__dirname, 'public')))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/image', (req, res) => {
    // console.log()
    res.sendFile(__dirname + '/uploads/images/' + req.query.filePath)
})

app.post('/upload', upload.single('photo'), (req, res) => {
    if (req.file) {
        res.json(req.file);
        return res.status(200);
    } else {
        return res.status(401).json({ error: 'Please provide an image' });
    }
});