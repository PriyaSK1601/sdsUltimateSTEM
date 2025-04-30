//setting up the tables in mongo db 
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const submissionSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    entryDate: { type: Date, default: Date.now },
    status: { type: String, default: "pending", enum: ["pending", "approved", "declined"] },  // New field
  });

const Submission = mongoose.model("Submission", submissionSchema, "submission-data");
const mySchemas = { Submission };
module.exports = mySchemas;