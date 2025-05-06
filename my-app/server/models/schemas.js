const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  status: { type: String, default: "pending", enum: ["pending", "approved", "declined"] },
});

const Submission = mongoose.model("Submission", submissionSchema, "submission-data");

module.exports = { Submission };