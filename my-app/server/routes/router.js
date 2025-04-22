const express = require('express');
const router = express.Router();
const multer = require('multer');  
const upload = multer(); 


router.post('/contact', upload.single('image'), (req, res) => {  // Use upload.single('image') to handle the image file
    const { title, description, category, displayName } = req.body;
    const image = req.file ? req.file.path : null;  // If an image was uploaded, store the file path

    console.log(`${title} | ${description} | ${category} | ${image}`);
    res.send('Submission Success!');
});

module.exports = router;
