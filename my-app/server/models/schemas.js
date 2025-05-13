const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Submission Schema
const submissionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  image: {
    data: Buffer,
    contentType: String,
  },
  entryDate: { type: Date, default: Date.now },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "approved", "declined"],
  },
  votes: { type: Number, default: 0 },
});

const Submission = mongoose.model("Submission", submissionSchema, "submission-data");

// Tournament Schema
const tournamentSchema = new Schema({
  round: { type: Number, required: true },
  roundName: { type: String, required: true },
  endDate: { type: Date, required: true },
  submissionID: { type: Schema.Types.ObjectId, ref: "Submission" },
  submissionVotes: { type: Number, default: 0 },
});

const Tournament = mongoose.model("Tournament", tournamentSchema, "tournament-data");

// ✅ Vote Schema
const voteSchema = new Schema({
  firebaseUID: { type: String, required: true },
  submissionId: { type: Schema.Types.ObjectId, ref: "Submission", required: true },
  round: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Vote = mongoose.model("Vote", voteSchema, "vote-data");

// ✅ Export all
module.exports = {
  Submission,
  Tournament,
  Vote,
};
