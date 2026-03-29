// backend/src/models/Institution.js
import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Institution', institutionSchema);