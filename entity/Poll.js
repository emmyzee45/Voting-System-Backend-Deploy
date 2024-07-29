import mongoose from "mongoose";
const { Schema } = mongoose;

const pollSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  candidates: [{
    type: Schema.Types.ObjectId,
    ref: "Candidate"
  }]
}, { timestamps: true });

export default mongoose.model("Poll", pollSchema);