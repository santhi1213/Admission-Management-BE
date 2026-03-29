// backend/src/routes/allocation.js - Updated without authentication for fee update
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import Applicant from '../models/Applicant.js';
import Program from '../models/Program.js';

const router = express.Router();

// Check seat availability for quota - Keep authentication
router.get('/availability/:programId/:quotaType',
  authenticate,
  async (req, res, next) => {
    try {
      const { programId, quotaType } = req.params;
      
      const program = await Program.findById(programId);
      if (!program) {
        return res.status(404).json({ error: 'Program not found' });
      }

      const quota = program.quotas.find(q => q.type === quotaType);
      if (!quota) {
        return res.status(404).json({ error: 'Quota not found' });
      }

      const remaining = quota.totalSeats - quota.filledSeats;

      res.json({
        total: quota.totalSeats,
        filled: quota.filledSeats,
        remaining: remaining,
        available: remaining > 0
      });
    } catch (error) {
      next(error);
    }
});

// Allocate seat to applicant - Keep authentication
router.post('/allocate',
  authenticate,
  authorize('admin', 'officer'),
  body('applicantId').notEmpty(),
  body('programId').notEmpty(),
  body('quotaType').notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { applicantId, programId, quotaType, allotmentNumber } = req.body;

      // Get applicant
      const applicant = await Applicant.findById(applicantId);
      if (!applicant) {
        return res.status(404).json({ error: 'Applicant not found' });
      }

      if (applicant.admissionStatus !== 'pending') {
        return res.status(400).json({ error: 'Applicant already allocated or confirmed' });
      }

      // Get program and update quota
      const program = await Program.findById(programId);
      if (!program) {
        return res.status(404).json({ error: 'Program not found' });
      }

      const quota = program.quotas.find(q => q.type === quotaType);
      if (!quota) {
        return res.status(404).json({ error: 'Quota not found' });
      }

      if (quota.filledSeats >= quota.totalSeats) {
        return res.status(400).json({ error: 'No seats available in this quota' });
      }

      // Update quota filled seats
      quota.filledSeats += 1;
      await program.save();

      // Update applicant
      applicant.programId = programId;
      applicant.quotaType = quotaType;
      applicant.allotmentNumber = allotmentNumber;
      applicant.admissionStatus = 'allocated';
      await applicant.save();

      res.json({ 
        message: 'Seat allocated successfully',
        applicant: {
          id: applicant._id,
          name: applicant.fullName,
          status: applicant.admissionStatus
        }
      });
    } catch (error) {
      next(error);
    }
});

// Confirm admission - Keep authentication
router.post('/confirm/:applicantId',
  authenticate,
  authorize('admin', 'officer'),
  async (req, res, next) => {
    try {
      const { applicantId } = req.params;

      // Get applicant with program details
      const applicant = await Applicant.findById(applicantId)
        .populate({
          path: 'programId',
          populate: {
            path: 'departmentId',
            populate: {
              path: 'campusId',
              populate: {
                path: 'institutionId'
              }
            }
          }
        });

      if (!applicant) {
        return res.status(404).json({ error: 'Applicant not found' });
      }

      if (applicant.admissionStatus !== 'allocated') {
        return res.status(400).json({ error: 'Seat not allocated yet' });
      }

      if (applicant.feeStatus !== 'paid') {
        return res.status(400).json({ error: 'Fee must be paid before confirmation' });
      }

      // Check if all documents are verified
      const pendingDocs = applicant.documents.filter(doc => doc.status !== 'verified');
      if (pendingDocs.length > 0) {
        return res.status(400).json({ error: 'All documents must be verified before confirmation' });
      }

      // Generate admission number
      const year = new Date().getFullYear();
      const institutionName = applicant.programId?.departmentId?.campusId?.institutionId?.name || 'INST';
      const courseType = applicant.programId?.courseType || 'UG';
      const programCode = applicant.programId?.name?.substring(0, 3).toUpperCase() || 'PRG';
      const quotaCode = applicant.quotaType;
      
      // Get sequence number
      const totalConfirmed = await Applicant.countDocuments({ 
        admissionNumber: { $ne: null } 
      });
      const seq = String(totalConfirmed + 1).padStart(4, '0');
      
      const admissionNumber = `${institutionName}/${year}/${courseType}/${programCode}/${quotaCode}/${seq}`;

      // Update applicant
      applicant.admissionNumber = admissionNumber;
      applicant.admissionStatus = 'confirmed';
      await applicant.save();

      res.json({ 
        admissionNumber, 
        message: 'Admission confirmed successfully' 
      });
    } catch (error) {
      next(error);
    }
});

// Update fee status - REMOVED AUTHENTICATION
router.patch('/:applicantId/fee',
  body('feeStatus').isIn(['pending', 'paid']),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { applicantId } = req.params;
      const { feeStatus } = req.body;

      console.log(`Updating fee status for applicant ${applicantId} to ${feeStatus}`);

      const applicant = await Applicant.findById(applicantId);
      if (!applicant) {
        return res.status(404).json({ error: 'Applicant not found' });
      }

      applicant.feeStatus = feeStatus;
      await applicant.save();

      res.json({
        success: true,
        message: 'Fee status updated successfully',
        applicant: {
          id: applicant._id,
          name: applicant.fullName,
          feeStatus: applicant.feeStatus
        }
      });
    } catch (error) {
      console.error('Error updating fee status:', error);
      next(error);
    }
});

export default router;