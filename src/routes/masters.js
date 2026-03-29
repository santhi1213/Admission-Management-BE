// backend/src/routes/masters.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Institution from '../models/Institution.js';
import Campus from '../models/Campus.js';
import Department from '../models/Department.js';
import Program from '../models/Program.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==================== INSTITUTIONS ====================
// Create institution
router.post('/institutions',
  authenticate,
  authorize('admin'),
  body('name').notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const institution = await Institution.create(req.body);
    res.status(201).json(institution);
  })
);

// Get all institutions
router.get('/institutions',
  authenticate,
  asyncHandler(async (req, res) => {
    const institutions = await Institution.find().sort({ createdAt: -1 });
    res.json(institutions);
  })
);

// Get institution by ID
router.get('/institutions/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.json(institution);
  })
);

// Update institution
router.put('/institutions/:id',
  authenticate,
  authorize('admin'),
  body('name').notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.json(institution);
  })
);

// Delete institution
router.delete('/institutions/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const institution = await Institution.findByIdAndDelete(req.params.id);
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.json({ message: 'Institution deleted successfully' });
  })
);

// ==================== CAMPUSES ====================
// Create campus
router.post('/campuses',
  authenticate,
  authorize('admin'),
  body('institutionId').notEmpty(),
  body('name').notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campus = await Campus.create(req.body);
    res.status(201).json(campus);
  })
);

// Get all campuses
router.get('/campuses',
  authenticate,
  asyncHandler(async (req, res) => {
    const campuses = await Campus.find().populate('institutionId', 'name').sort({ createdAt: -1 });
    res.json(campuses);
  })
);

// Get campuses by institution
router.get('/campuses/by-institution/:institutionId',
  authenticate,
  asyncHandler(async (req, res) => {
    const campuses = await Campus.find({ institutionId: req.params.institutionId }).populate('institutionId', 'name');
    res.json(campuses);
  })
);

// Get campus by ID
router.get('/campuses/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const campus = await Campus.findById(req.params.id).populate('institutionId', 'name');
    if (!campus) {
      return res.status(404).json({ error: 'Campus not found' });
    }
    res.json(campus);
  })
);

// Update campus
router.put('/campuses/:id',
  authenticate,
  authorize('admin'),
  body('name').notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campus = await Campus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!campus) {
      return res.status(404).json({ error: 'Campus not found' });
    }
    res.json(campus);
  })
);

// Delete campus
router.delete('/campuses/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const campus = await Campus.findByIdAndDelete(req.params.id);
    if (!campus) {
      return res.status(404).json({ error: 'Campus not found' });
    }
    res.json({ message: 'Campus deleted successfully' });
  })
);

// ==================== DEPARTMENTS ====================
// Create department
router.post('/departments',
  authenticate,
  authorize('admin'),
  body('campusId').notEmpty(),
  body('name').notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const department = await Department.create(req.body);
    res.status(201).json(department);
  })
);

// Get all departments
router.get('/departments',
  authenticate,
  asyncHandler(async (req, res) => {
    const departments = await Department.find().populate('campusId', 'name').sort({ createdAt: -1 });
    res.json(departments);
  })
);

// Get departments by campus
router.get('/departments/by-campus/:campusId',
  authenticate,
  asyncHandler(async (req, res) => {
    const departments = await Department.find({ campusId: req.params.campusId }).populate('campusId', 'name');
    res.json(departments);
  })
);

// Get department by ID
router.get('/departments/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id).populate('campusId', 'name');
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  })
);

// Update department
router.put('/departments/:id',
  authenticate,
  authorize('admin'),
  body('name').notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  })
);

// Delete department
router.delete('/departments/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json({ message: 'Department deleted successfully' });
  })
);

// ==================== PROGRAMS ====================
// Create program with quotas
router.post('/programs',
  authenticate,
  authorize('admin'),
  body('departmentId').notEmpty(),
  body('name').notEmpty(),
  body('courseType').isIn(['UG', 'PG']),
  body('entryType').isIn(['Regular', 'Lateral']),
  body('admissionMode').isIn(['Government', 'Management']),
  body('academicYear').notEmpty(),
  body('totalIntake').isInt({ min: 1 }),
  body('quotas').isArray(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const program = await Program.create(req.body);
    res.status(201).json(program);
  })
);

// Get all programs with populated data
router.get('/programs',
  authenticate,
  asyncHandler(async (req, res) => {
    const programs = await Program.find()
      .populate({
        path: 'departmentId',
        populate: {
          path: 'campusId',
          populate: {
            path: 'institutionId'
          }
        }
      })
      .sort({ createdAt: -1 });
    
    // Format response
    const formattedPrograms = programs.map(program => ({
      id: program._id,
      name: program.name,
      courseType: program.courseType,
      entryType: program.entryType,
      admissionMode: program.admissionMode,
      academicYear: program.academicYear,
      totalIntake: program.totalIntake,
      department: program.departmentId,
      quotas: program.quotas.map(q => ({
        type: q.type,
        total: q.totalSeats,
        filled: q.filledSeats
      }))
    }));
    
    res.json(formattedPrograms);
  })
);

// Get program by ID
router.get('/programs/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const program = await Program.findById(req.params.id)
      .populate({
        path: 'departmentId',
        populate: {
          path: 'campusId',
          populate: {
            path: 'institutionId'
          }
        }
      });
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }
    res.json(program);
  })
);

// Update program
router.put('/programs/:id',
  authenticate,
  authorize('admin'),
  body('name').notEmpty(),
  body('totalIntake').isInt({ min: 1 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }
    res.json(program);
  })
);

// Delete program
router.delete('/programs/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }
    res.json({ message: 'Program deleted successfully' });
  })
);

export default router;