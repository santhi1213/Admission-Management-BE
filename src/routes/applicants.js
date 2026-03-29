// backend/src/routes/applicants.js - Updated without authentication for document update
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import Applicant from '../models/Applicant.js';

const router = express.Router();

// Create applicant - Keep authentication
router.post('/',
  authenticate,
  authorize('admin', 'officer'),
  body('fullName').notEmpty(),
  body('email').isEmail(),
  body('category').isIn(['GM', 'SC', 'ST', 'OBC']),
  body('entryType').isIn(['Regular', 'Lateral']),
  body('quotaType').notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await Applicant.findOne({ email: req.body.email });
      if (existing) {
        return res.status(400).json({ error: 'Applicant with this email already exists' });
      }

      const applicant = await Applicant.create(req.body);
      res.status(201).json(applicant);
    } catch (error) {
      next(error);
    }
});

// Get all applicants - Keep authentication
router.get('/',
  authenticate,
  async (req, res, next) => {
    try {
      const applicants = await Applicant.find()
        .populate('programId', 'name')
        .sort({ createdAt: -1 });
      
      const formattedApplicants = applicants.map(applicant => ({
        id: applicant._id,
        full_name: applicant.fullName,
        email: applicant.email,
        phone: applicant.phone,
        date_of_birth: applicant.dateOfBirth,
        category: applicant.category,
        entry_type: applicant.entryType,
        quota_type: applicant.quotaType,
        program_id: applicant.programId?._id,
        program_name: applicant.programId?.name,
        marks_obtained: applicant.marksObtained,
        total_marks: applicant.totalMarks,
        allotment_number: applicant.allotmentNumber,
        admission_number: applicant.admissionNumber,
        admission_status: applicant.admissionStatus,
        fee_status: applicant.feeStatus,
        documents: applicant.documents
      }));
      
      res.json(formattedApplicants);
    } catch (error) {
      next(error);
    }
});

// Update document status - REMOVED AUTHENTICATION
router.patch('/:id/documents',
  body('documentType').notEmpty(),
  body('status').isIn(['pending', 'submitted', 'verified']),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { documentType, status } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      console.log(`Updating document: ${documentType} to status: ${status} for applicant: ${id}`);

      const applicant = await Applicant.findById(id);
      if (!applicant) {
        return res.status(404).json({ error: 'Applicant not found' });
      }

      const document = applicant.documents.find(doc => doc.type === documentType);
      if (!document) {
        return res.status(404).json({ error: `Document '${documentType}' not found` });
      }

      document.status = status;
      await applicant.save();

      res.json({
        success: true,
        message: 'Document status updated successfully',
        document: {
          type: document.type,
          status: document.status
        }
      });
    } catch (error) {
      console.error('Error updating document:', error);
      next(error);
    }
});

// Get applicant by ID - Keep authentication
router.get('/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const applicant = await Applicant.findById(req.params.id).populate('programId');
      if (!applicant) {
        return res.status(404).json({ error: 'Applicant not found' });
      }
      res.json(applicant);
    } catch (error) {
      next(error);
    }
});

// Update applicant details - Keep authentication
router.patch('/:id',
  authenticate,
  authorize('admin', 'officer'),
  async (req, res, next) => {
    try {
      const applicant = await Applicant.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!applicant) {
        return res.status(404).json({ error: 'Applicant not found' });
      }
      res.json(applicant);
    } catch (error) {
      next(error);
    }
});

export default router;