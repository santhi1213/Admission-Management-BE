// backend/src/models/Applicant.js
import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'verified'],
    default: 'pending'
  }
});

const applicantSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: String,
  dateOfBirth: Date,
  category: {
    type: String,
    enum: ['GM', 'SC', 'ST', 'OBC'],
    required: true
  },
  entryType: {
    type: String,
    enum: ['Regular', 'Lateral'],
    required: true
  },
  quotaType: {
    type: String,
    required: true
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  marksObtained: {
    type: Number,
    min: 0,
    max: 100
  },
  totalMarks: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  allotmentNumber: String,
  admissionNumber: String,
  admissionStatus: {
    type: String,
    enum: ['pending', 'allocated', 'confirmed'],
    default: 'pending'
  },
  feeStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  documents: [documentSchema]
}, {
  timestamps: true
});

// Corrected pre-save middleware for Mongoose 8.x
applicantSchema.pre('save', function() {
  if (this.isNew && (!this.documents || this.documents.length === 0)) {
    const defaultDocuments = [
      '10th Marksheet',
      '12th Marksheet',
      'Category Certificate',
      'Transfer Certificate',
      'Migration Certificate'
    ];
    
    this.documents = defaultDocuments.map(doc => ({
      type: doc,
      status: 'pending'
    }));
  }
});

export default mongoose.model('Applicant', applicantSchema);