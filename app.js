// backend/src/app.js (Simplified version)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './src/routes/auth.js';
import masterRoutes from './src/routes/masters.js';
import applicantRoutes from './src/routes/applicants.js';
import allocationRoutes from './src/routes/allocation.js';
import dashboardRoutes from './src/routes/dashboard.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { initializeDatabase } from './src/config/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Simple CORS middleware that works with Express 5
app.use((req, res, next) => {
  // Allow all origins in development
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Body parsing
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://santhiraju32_db_user:X26B4qYuIYwMvhrV@cluster0.pccqwjo.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    await initializeDatabase();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;