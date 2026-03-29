// backend/src/models/Campus.js
import mongoose from 'mongoose';

const campusSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Campus', campusSchema);