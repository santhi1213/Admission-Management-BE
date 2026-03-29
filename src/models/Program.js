// backend/src/models/Program.js
import mongoose from 'mongoose';

const quotaSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 0
  },
  filledSeats: {
    type: Number,
    default: 0,
    min: 0
  }
});

const programSchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  courseType: {
    type: String,
    enum: ['UG', 'PG'],
    required: true
  },
  entryType: {
    type: String,
    enum: ['Regular', 'Lateral'],
    required: true
  },
  admissionMode: {
    type: String,
    enum: ['Government', 'Management'],
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  totalIntake: {
    type: Number,
    required: true,
    min: 1
  },
  quotas: [quotaSchema]
}, {
  timestamps: true
});

// Corrected pre-save middleware for Mongoose 8.x
programSchema.pre('save', function() {
  const totalQuotaSeats = this.quotas.reduce((sum, quota) => sum + quota.totalSeats, 0);
  if (totalQuotaSeats !== this.totalIntake) {
    throw new Error(`Total quota seats (${totalQuotaSeats}) must equal total intake (${this.totalIntake})`);
  }
});

export default mongoose.model('Program', programSchema);