import mongoose, { mongo } from "mongoose";

const { Schema } = mongoose;

const candidateSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  poll: {
    type: Schema.Types.ObjectId,
    ref: "Poll"
  }
}, { timestamps:  true });

export default mongoose.model("Candidate", candidateSchema);