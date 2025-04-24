const express = require('express');
const router = express.Router();

const multer = require('multer');  // Import multer
const upload = multer();  // You can use the default multer setup or customize it as needed
const schemas = require('../models/schemas')

router.post('/contact', upload.single('image'),async (req, res) => {  // Use upload.single('image') to handle the image file
    const { title, description, category } = req.body;
  
    const image = req.file ? req.file.path : null;  // If an image was uploaded, store the file path


    const submissionData = {title: title, description: description, category: category}
    const newSubmission = new schemas.Submission(submissionData)
    const saveSubmission = await newSubmission.save()
    if(saveSubmission) {
        res.send('Submission Success');
    } else {
        res.send("Submisison failed");
    }
    
});

module.exports = router;
