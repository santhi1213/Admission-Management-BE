// backend/src/config/init.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Institution from '../models/Institution.js';
import Campus from '../models/Campus.js';
import Department from '../models/Department.js';
import Program from '../models/Program.js';

export const initializeDatabase = async () => {
  try {
    // Check if connection is ready
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for database connection...');
      // Wait for connection
      await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
      });
    }

    console.log('Starting database initialization...');

    // Create default admin user
    const adminExists = await User.findOne({ email: 'admin@edumerge.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@edumerge.com',
        passwordHash: hashedPassword,
        role: 'admin'
      });
      console.log('✓ Default admin user created');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create default institution
    let institution = await Institution.findOne({ name: 'EduMerge University' });
    if (!institution) {
      institution = await Institution.create({ name: 'EduMerge University' });
      console.log('✓ Default institution created');
    } else {
      console.log('✓ Institution already exists');
    }

    // Create default campus
    let campus = await Campus.findOne({ name: 'Main Campus' });
    if (!campus) {
      campus = await Campus.create({
        institutionId: institution._id,
        name: 'Main Campus'
      });
      console.log('✓ Default campus created');
    } else {
      console.log('✓ Campus already exists');
    }

    // Create default department
    let department = await Department.findOne({ name: 'Computer Science' });
    if (!department) {
      department = await Department.create({
        campusId: campus._id,
        name: 'Computer Science'
      });
      console.log('✓ Default department created');
    } else {
      console.log('✓ Department already exists');
    }

    // Create default program with quotas
    const programExists = await Program.findOne({ name: 'Computer Science Engineering' });
    if (!programExists) {
      try {
        await Program.create({
          departmentId: department._id,
          name: 'Computer Science Engineering',
          courseType: 'UG',
          entryType: 'Regular',
          admissionMode: 'Government',
          academicYear: '2026',
          totalIntake: 100,
          quotas: [
            { type: 'KCET', totalSeats: 50, filledSeats: 0 },
            { type: 'COMEDK', totalSeats: 30, filledSeats: 0 },
            { type: 'Management', totalSeats: 20, filledSeats: 0 }
          ]
        });
        console.log('✓ Default program created');
      } catch (error) {
        console.error('Error creating default program:', error.message);
      }
    } else {
      console.log('✓ Program already exists');
    }

    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
    console.error('Error stack:', error.stack);
  }
};