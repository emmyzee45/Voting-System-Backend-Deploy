import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  citizenshipNumber: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    maxlength: 180
  },
  password: {
    type: String,
    required: true
  },
  faceId: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);