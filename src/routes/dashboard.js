// backend/src/routes/dashboard.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Program from '../models/Program.js';
import Applicant from '../models/Applicant.js';

const router = express.Router();

// Dashboard for Management view
router.get('/',
  authenticate,
  authorize('admin', 'officer', 'management'),
  async (req, res, next) => {
    try {
      // Get total intake vs admitted
      const programs = await Program.find();
      const totalIntake = programs.reduce((sum, p) => sum + p.totalIntake, 0);
      
      const confirmedApplicants = await Applicant.countDocuments({ admissionStatus: 'confirmed' });
      
      // Get quota-wise filled seats
      const quotaWise = {};
      for (const program of programs) {
        for (const quota of program.quotas) {
          if (!quotaWise[quota.type]) {
            quotaWise[quota.type] = { total: 0, filled: 0 };
          }
          quotaWise[quota.type].total += quota.totalSeats;
          quotaWise[quota.type].filled += quota.filledSeats;
        }
      }
      
      const quotaWiseArray = Object.entries(quotaWise).map(([type, data]) => ({
        quota_type: type,
        total_seats: data.total,
        filled_seats: data.filled
      }));
      
      // Get remaining seats per program
      const admittedCounts = await Applicant.aggregate([
        { $match: { admissionStatus: 'confirmed' } },
        { $group: { _id: '$programId', count: { $sum: 1 } } }
      ]);
      
      const admittedMap = {};
      admittedCounts.forEach(item => {
        admittedMap[item._id] = item.count;
      });
      
      const remainingSeats = programs.map(program => ({
        program_name: program.name,
        total_intake: program.totalIntake,
        admitted: admittedMap[program._id] || 0,
        remaining: program.totalIntake - (admittedMap[program._id] || 0)
      })).filter(p => p.remaining > 0);
      
      // Get applicants with pending documents
      const allApplicants = await Applicant.find();
      const pendingDocuments = allApplicants
        .map(applicant => {
          const pendingCount = applicant.documents.filter(doc => doc.status === 'pending').length;
          if (pendingCount > 0) {
            return {
              id: applicant._id,
              full_name: applicant.fullName,
              email: applicant.email,
              pending_count: pendingCount
            };
          }
          return null;
        })
        .filter(item => item !== null);
      
      // Get fee pending list
      const feePending = await Applicant.find({
        feeStatus: 'pending',
        admissionStatus: 'allocated'
      }).select('fullName email admissionStatus');
      
      res.json({
        intake: {
          total_intake: totalIntake,
          total_admitted: confirmedApplicants
        },
        quotaWise: quotaWiseArray,
        remainingSeats: remainingSeats,
        pendingDocuments: pendingDocuments,
        feePending: feePending.map(f => ({
          id: f._id,
          full_name: f.fullName,
          email: f.email,
          admission_status: f.admissionStatus
        }))
      });
    } catch (error) {
      next(error);
    }
});

export default router;