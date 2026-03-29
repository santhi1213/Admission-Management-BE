// backend/src/models/Department.js
import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  campusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Department', departmentSchema);