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


router.get('/submissions', async (req, res) => {
    try {
        const submissions = await schemas.Submission.find(); // Fetch all submissions
        res.json(submissions); // Send them as a response
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Error fetching submissions" });
    }
});

router.patch("/submissions/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedSubmission = await schemas.Submission.findByIdAndUpdate(
        id,
        { status: "approved" }, // Update status to 'approved'
        { new: true }
      );
      
      if (!updatedSubmission) {
        return res.status(404).json({ message: "Submission not found" });
      }
  
      res.json(updatedSubmission); // Send the updated submission back
    } catch (error) {
      console.error("Error approving submission:", error);
      res.status(500).json({ message: "Error approving submission" });
    }
  });
  
  // Decline submission route
  router.patch("/submissions/:id/decline", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedSubmission = await schemas.Submission.findByIdAndUpdate(
        id,
        { status: "declined" }, // Update status to 'declined'
        { new: true }
      );
      
      if (!updatedSubmission) {
        return res.status(404).json({ message: "Submission not found" });
      }
  
      res.json(updatedSubmission); // Send the updated submission back
    } catch (error) {
      console.error("Error declining submission:", error);
      res.status(500).json({ message: "Error declining submission" });
    }
  });

module.exports = router;
