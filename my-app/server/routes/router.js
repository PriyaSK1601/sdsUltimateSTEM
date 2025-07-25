const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const schemas = require("../models/schemas");
const axios = require("axios");
const bodyParser = require('body-parser');
const { RoundWinners } = require("../models/schemas");

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

//Vote count
router.post("/votes", async (req, res) => {
  const { firebaseUID, round, matchIndex, submissionId } = req.body;
  if (!firebaseUID || round == null || matchIndex == null || !submissionId)
    return res.status(400).json({ message: "Missing data" });

  // Check if the current round is active
  const now = new Date();
  const activeRound = await schemas.Tournament.findOne({
    round: round,
    endDate: { $gt: now },
  });

  if (!activeRound) {
    return res
      .status(400)
      .json({ message: "Voting is not allowed for this round at this time" });
  }

  const Vote = schemas.Vote;
  const Submission = schemas.Submission;

  const existing = await Vote.findOne({ firebaseUID, round, matchIndex });

  // helper clamps ≥0
  const safeInc = (id, delta) =>
    Submission.findByIdAndUpdate(
      id,
      [{ $set: { votes: { $max: [{ $add: ["$votes", delta] }, 0] } } }],
      { new: true }
    ).exec();

  // no previous vote
  if (!existing) {
    await Vote.create({ firebaseUID, round, matchIndex, submissionId });
    const sub = await safeInc(submissionId, +1);
    return res.json({ action: "added", submission: sub });
  }

  // same submission clicked = UN-VOTE
  if (existing.submissionId.toString() === submissionId) {
    await existing.deleteOne();
    const sub = await safeInc(submissionId, -1);
    return res.json({ action: "removed", submission: sub });
  }

  // switch vote to other contender
  const oldId = existing.submissionId;
  existing.submissionId = submissionId;
  await existing.save();

  const [oldSub, newSub] = await Promise.all([
    safeInc(oldId, -1),
    safeInc(submissionId, +1),
  ]);

  return res.json({
    action: "switched",
    oldSubmission: oldSub,
    submission: newSub,
  });
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

    // Clear existing tournament data
    await schemas.Tournament.deleteMany({});
    //Also clear existing round winners
    await schemas.RoundWinners.deleteMany({}); 

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

// reset ALL votes
router.patch("/submissions/reset-votes", async (_req, res) => {
  try {
    await Promise.all([
      schemas.Submission.updateMany({}, { $set: { votes: 0 } }),
      schemas.Vote.deleteMany({}),      // wipe who-voted
    ]);
    res.json({ message: "All votes and vote records cleared." });
  } catch (e) {
    res.status(500).json({ error: "reset-failed" });
  }
});

// reset ONE submission
router.patch("/submissions/:id/reset-votes", async (req, res) => {
  try {
    const { id } = req.params;
    await Promise.all([
      schemas.Submission.findByIdAndUpdate(id, { votes: 0 }),
      schemas.Vote.deleteMany({ submissionId: id }), // wipe votes on that submission
    ]);
    res.json({ message: "Submission votes cleared." });
  } catch (e) { res.status(500).json({ error: "reset-failed" }); }
});

// Get current active round
router.get("/tournament/current-round", async (req, res) => {
  try {
    const now = new Date();
    const activeRound = await schemas.Tournament.findOne({
      endDate: { $gt: now }
    }).sort({ round: 1 });
    
    if (activeRound) {
      res.json({ 
        round: activeRound.round,
        roundName: activeRound.roundName,
        endDate: activeRound.endDate,
        isActive: true
      });
    } else {
      res.json({ isActive: false });
    }
  } catch (error) {
    console.error("Error fetching current round:", error);
    res.status(500).json({ message: "Error fetching current round" });
  }
});

//Check round completion
router.post("/tournament/process-round-completion", async (req, res) => {
  try {
    const now = new Date();

    // Find most recently completed round
    const completedRound = await schemas.Tournament.findOne({
      endDate: { $lte: now },
    }).sort({ round: -1 });

    if (!completedRound) {
      return res.json({ message: "No completed rounds found" });
    }

    const roundNumber = completedRound.round;

    // Check if round has already been processed
    const existingWinners = await schemas.RoundWinners.findOne({
      round: roundNumber,
    });
    if (existingWinners) {
      return res.json({ message: "Round already processed" });
    }

    let winners = [];

    if (roundNumber === 0) {
      // Round 1
      const submissions = await schemas.Submission.find({
        status: "approved",
      }).sort({ entryDate: 1 });
      const paddedSubmissions = [...submissions];
      while (paddedSubmissions.length < 16) paddedSubmissions.push(null);

      for (let i = 0; i < 8; i++) {
        const s1 = paddedSubmissions[i * 2];
        const s2 = paddedSubmissions[i * 2 + 1];

        if (s1 && !s2) {
          winners.push(s1._id);
        } else if (!s1 && s2) {
          winners.push(s2._id);
        } else if (s1 && s2) {
          winners.push(s1.votes >= s2.votes ? s1._id : s2._id);
        }
      }
    } else {
      // Rounds 1, 2, 3
      const previousWinners = await schemas.RoundWinners.findOne({
        round: roundNumber - 1,
      });
      if (!previousWinners) {
        return res
          .status(400)
          .json({ message: "Previous round winners not found" });
      }

      const previousSubmissions = await schemas.Submission.find({
        _id: { $in: previousWinners.winners },
      });

      const numMatches = Math.floor(previousSubmissions.length / 2);
      for (let i = 0; i < numMatches; i++) {
        const s1 = previousSubmissions[i * 2];
        const s2 = previousSubmissions[i * 2 + 1];

        if (s1 && s2) {
          winners.push(s1.votes >= s2.votes ? s1._id : s2._id);
        } else if (s1) {
          winners.push(s1._id);
        } else if (s2) {
          winners.push(s2._id);
        }
      }
    }

    // Save winners
    await schemas.RoundWinners.updateOne(
      { round: roundNumber },
      { $set: { winners: winners } },
      { upsert: true }
    );

    if (roundNumber === 3 && winners.length > 0) {
      const tournamentId = `tournament_${Date.now()}`;
      const finalWinnerId = winners[0]; // Should only be one winner from round 3

      try {
        await axios.post("http://localhost:3001/tournament-winner", {
          tournamentId,
          winnerId: finalWinnerId,
        });
      } catch (winnerError) {
        console.error("Error storing tournament winner:", winnerError);
      }
    }

    // Reset all votes for next round
    await schemas.Submission.updateMany({}, { $set: { votes: 0 } });
    await schemas.Vote.deleteMany({});

    res.json({
      message: `Round ${roundNumber + 1} completed successfully`,
      round: roundNumber,
      winners: winners,
    });
  } catch (error) {
    console.error("Error processing round completion:", error);
    res.status(500).json({ message: "Error processing round completion" });
  }
});

// Get round winners
router.get("/round-winners/:round", async (req, res) => {
  try {
    const round = parseInt(req.params.round);
    const roundWinners = await schemas.RoundWinners.findOne({ round: round });
    
    if (roundWinners) {
      res.json({ winners: roundWinners.winners });
    } else {
      res.json({ winners: [] });
    }
  } catch (error) {
    console.error("Error fetching round winners:", error);
    res.status(500).json({ message: "Error fetching round winners" });
  }
});

//Get final winner 
router.get("/tournament/final-winner", async (req, res) => {
  try {
    const finalRound = await RoundWinners.findOne({ round: 5 }).populate("winners");

    if (!finalRound || !finalRound.winners || finalRound.winners.length === 0) {
      return res.json({ winner: null });
    }

    // Return the first winner (should be only one)
    res.json({ winner: finalRound.winners[0] });
  } catch (err) {
    console.error("Error fetching final winner:", err);
    res.status(500).json({ error: "Failed to get final winner" });
  }
});


router.post("/tournament-winner", async (req, res) => {
  const { winnerId } = req.body;

  if (!winnerId) {
    return res.status(400).json({ error: "Missing winnerId in request body" });
  }

  try {
    const updated = await RoundWinners.findOneAndUpdate(
      { round: 5 },
      { winners: [winnerId] },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Final winner set successfully", data: updated });
  } catch (err) {
    console.error("Error setting final winner:", err);
    res.status(500).json({ error: "Failed to set final winner" });
  }
});

//Save edit changes
router.patch('/submissions/:id', async (req, res) => {
  try {
    const submissionId = req.params.id;
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      status: req.body.status,
      // other fields if needed
    };

    const updatedSubmission = await schemas.Submission.findByIdAndUpdate(
      submissionId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedSubmission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(updatedSubmission);
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//Delete Submission
router.delete("/submissions/:id", async (req, res) => {
  try {
    const submission = await schemas.Submission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ message: "Error deleting submission" });
  }
});

// Delete tournament (reset)
router.delete("/tournament", async (req, res) => {
  try {
    await schemas.Tournament.deleteMany({});
    await schemas.RoundWinners.deleteMany({}); //reset round winners as well
    res.status(200).json({ message: "Tournament reset successfully" });
  } catch (error) {
    console.error("Error resetting tournament:", error);
    res.status(500).json({ message: "Error resetting tournament" });
  }
});

// Upload/update profile photo
router.post("/profile-photo", upload.single("profilePhoto"), async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  try {
    const profilePhotoData = {
      email,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    };

    // Update existing or create new profile photo
    const updatedPhoto = await schemas.ProfilePhoto.findOneAndUpdate(
      { email },
      profilePhotoData,
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Profile photo updated successfully" });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).json({ message: "Error uploading profile photo" });
  }
});

// Get profile photo by email
router.get("/profile-photo/:email", async (req, res) => {
  try {
    const profilePhoto = await schemas.ProfilePhoto.findOne({ 
      email: req.params.email 
    });
    
    if (!profilePhoto || !profilePhoto.image || !profilePhoto.image.data) {
      return res.status(404).json({ message: "Profile photo not found" });
    }

    res.contentType(profilePhoto.image.contentType);
    res.send(profilePhoto.image.data);
  } catch (error) {
    console.error("Error fetching profile photo:", error);
    res.status(500).json({ message: "Error fetching profile photo" });
  }
});

// Delete profile photo
router.delete("/profile-photo/:email", async (req, res) => {
  try {
    const result = await schemas.ProfilePhoto.findOneAndDelete({ 
      email: req.params.email 
    });
    
    if (!result) {
      return res.status(404).json({ message: "Profile photo not found" });
    }

    res.status(200).json({ message: "Profile photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile photo:", error);
    res.status(500).json({ message: "Error deleting profile photo" });
  }
});

module.exports = router;
