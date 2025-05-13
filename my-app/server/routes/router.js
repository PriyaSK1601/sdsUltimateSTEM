const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const schemas = require("../models/schemas");

// Create new submission
router.post("/contact", upload.single("image"), async (req, res) => {
  const { title, description, category, author } = req.body;

  const submissionData = {
    title,
    description,
    category,
    author,
    status: "pending",
  };

  if (req.file) {
    submissionData.image = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
  }

  try {
    const newSubmission = new schemas.Submission(submissionData);
    await newSubmission.save();
    res.status(201).send("Submission Success");
  } catch (error) {
    console.error("Submission failed:", error);
    res.status(500).send("Submission failed");
  }
});

// Get all submissions
router.get("/submissions", async (req, res) => {
  try {
    const submissions = await schemas.Submission.find();
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

// Get image by submission ID
router.get("/image/:id", async (req, res) => {
  try {
    const submission = await schemas.Submission.findById(req.params.id);
    if (!submission || !submission.image || !submission.image.data) {
      return res.status(404).send("Image not found");
    }

    res.contentType(submission.image.contentType);
    res.send(submission.image.data);
  } catch (err) {
    console.error("Failed to get image:", err);
    res.status(500).send("Error retrieving image");
  }
});

// Approve submission
router.patch("/submissions/:id/approve", async (req, res) => {
  try {
    const submission = await schemas.Submission.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });
    res.status(200).json({ message: "Submission approved", submission });
  } catch (error) {
    console.error("Error approving submission:", error);
    res.status(500).json({ message: "Error approving submission" });
  }
});

// Decline submission
router.patch("/submissions/:submissionId/decline", async (req, res) => {
  try {
    const submission = await schemas.Submission.findById(
      req.params.submissionId
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Mark the submission as declined
    submission.status = "declined";
    await submission.save();
    res.status(200).json({ message: "Submission declined successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to decline submission" });
  }
});

// Restore submission by ID
router.patch("/submissions/:submissionId/restore", async (req, res) => {
  try {
    const submission = await schemas.Submission.findById(
      req.params.submissionId
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.status === "pending") {
      return res.status(400).json({ message: "Submission is already pending" });
    }

    submission.status = "pending";
    await submission.save();

    res
      .status(200)
      .json({ message: "Submission restored to pending", submission });
  } catch (error) {
    console.error("Error restoring submission:", error);
    res.status(500).json({ message: "Failed to restore submission" });
  }
});

// ✅ Vote endpoint (this is the new one!)
router.post("/submissions/:id/vote", async (req, res) => {
  const { firebaseUID, round } = req.body;
  const submissionId = req.params.id;

  if (!firebaseUID || round === undefined) {
    return res.status(400).json({ message: "Missing firebaseUID or round" });
  }

  try {
    // ✅ Check if user already voted in this round
    const existingVote = await schemas.Vote.findOne({ firebaseUID, round });

    if (existingVote) {
      return res.status(400).json({ message: "You already voted this round" });
    }

    // ✅ Save the vote
    const vote = new schemas.Vote({ firebaseUID, submissionId, round });
    await vote.save();

    // ✅ Increment vote count for submission
    const updatedSubmission = await schemas.Submission.findByIdAndUpdate(
      submissionId,
      { $inc: { votes: 1 } },
      { new: true }
    );

    res.status(200).json({
      message: "Vote recorded",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("Error recording vote:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get tournament data
router.get("/tournament", async (req, res) => {
  try {
    // Get all tournaments and sort by round number
    const tournaments = await schemas.Tournament.find().sort({ round: 1 });
    res.json(tournaments);
  } catch (error) {
    console.error("Error fetching tournament data:", error);
    res.status(500).json({ message: "Error fetching tournament data" });
  }
});

// Create or update tournament rounds
router.post("/tournament", async (req, res) => {
  try {
    const { rounds } = req.body;

    // First clear existing tournament data
    await schemas.Tournament.deleteMany({});

    // Insert all new rounds
    const createdRounds = await schemas.Tournament.insertMany(
      rounds.map((round, index) => ({
        round: index,
        roundName: round.name,
        endDate: new Date(round.targetDate),
      }))
    );

    res.status(201).json({
      message: "Tournament created successfully",
      tournament: createdRounds,
    });
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({ message: "Error creating tournament" });
  }
});

// Advance to next round
router.patch("/tournament/advance", async (req, res) => {
  try {
    const round = 1; // ✅ Hardcoded for now – only advancing Round 1 to Round 2

    // Get all approved submissions and ensure 16 total
    const submissions = await schemas.Submission.find({ status: "approved" }).sort({ entryDate: 1 });
    const paddedSubmissions = [...submissions];

    while (paddedSubmissions.length < 16) {
      paddedSubmissions.push(null); // fallback if fewer than 16
    }

    const round1Winners = [];

    for (let i = 0; i < 8; i++) {
      const s1 = paddedSubmissions[i * 2];
      const s2 = paddedSubmissions[i * 2 + 1];

      if (s1 && !s2) {
        round1Winners.push(s1._id); // s1 wins by default
      } else if (!s1 && s2) {
        round1Winners.push(s2._id); // s2 wins by default
      } else if (s1 && s2) {
        round1Winners.push(s1.votes >= s2.votes ? s1._id : s2._id); // ✅ vote comparison
      }
    }

    // Save or overwrite round 1 winners in RoundWinners
    await schemas.RoundWinners.findOneAndUpdate(
      { round: 1 },
      { winners: round1Winners },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Round 1 winners determined",
      round: 1,
      winners: round1Winners,
    });
  } catch (error) {
    console.error("Error advancing tournament round:", error);
    res.status(500).json({ message: "Error advancing tournament round" });
  }
});


// Delete tournament (reset)
router.delete("/tournament", async (req, res) => {
  try {
    await schemas.Tournament.deleteMany({});
    res.status(200).json({ message: "Tournament reset successfully" });
  } catch (error) {
    console.error("Error resetting tournament:", error);
    res.status(500).json({ message: "Error resetting tournament" });
  }
});

module.exports = router;
