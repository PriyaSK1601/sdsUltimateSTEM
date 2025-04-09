const express = require('express');
const router = express.Router();
const multer = require('multer');  // Import multer
const upload = multer();  // You can use the default multer setup or customize it as needed

router.post('/contact', upload.single('image'), (req, res) => {  // Use upload.single('image') to handle the image file
    const { title, description, category } = req.body;
    const image = req.file ? req.file.path : null;  // If an image was uploaded, store the file path

    console.log(`${title} | ${description} | ${category} | ${image}`);
    res.send('Submission Success!');
});

module.exports = router;
