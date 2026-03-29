EduMerge Admission System - Backend
Overview
EduMerge Admission System Backend is a robust Node.js/Express REST API that powers the complete admission management workflow. It provides secure authentication, role-based access control, and comprehensive CRUD operations for managing institutions, campuses, departments, programs, applicants, seat allocation, and admission confirmation.

Features
Authentication & Authorization
JWT-based authentication with 7-day token expiration

Role-based access control (Admin, Officer, Management)

Secure password hashing using bcryptjs

Protected routes with middleware authentication

Master Data Management
Institutions: Create, read, update, delete educational institutions

Campuses: Manage campuses under institutions

Departments: Organize departments within campuses

Programs: Comprehensive program management with:

Course type (UG/PG)

Entry type (Regular/Lateral)

Admission mode (Government/Management)

Academic year tracking

Total intake capacity

Quota-wise seat allocation (KCET, COMEDK, Management)

Automatic validation of quota seats vs total intake

Applicant Management
Create and manage applicant profiles

Automatic document initialization (10th Marksheet, 12th Marksheet, Category Certificate, Transfer Certificate, Migration Certificate)

Document verification workflow (Pending → Submitted → Verified)

Fee status tracking (Pending/Paid)

Applicant status tracking (Pending/Allocated/Confirmed)

Program and quota assignment

Seat Allocation System
Real-time quota-wise seat availability checking

Seat allocation with allotment number generation

Automatic quota seat increment on allocation

Prevents overallocation with seat capacity validation

Allocation history tracking

Admission Workflow
Applicant registration with automatic document creation

Seat allocation with quota validation

Document verification (individual document status tracking)

Fee payment tracking

Final admission confirmation with unique admission number generation

Dashboard Analytics
Total intake vs total admitted statistics

Quota-wise seat filling analysis

Program-wise remaining seats

Applicants with pending documents

Fee pending applicants list

Technology Stack
Technology	Version	Purpose
Node.js	v18+	Runtime environment
Express.js	5.2.1	Web framework
MongoDB	6.0+	Database
Mongoose	9.3.3	ODM
JSON Web Token	9.0.3	Authentication
bcryptjs	3.0.3	Password hashing
express-validator	7.3.1	Input validation
cors	2.8.6	CORS handling
dotenv	17.3.1	Environment variables
Prerequisites
Node.js (v18 or higher)

MongoDB (v6.0 or higher) installed and running

npm or yarn package manager

Git

Installation & Setup
1. Clone the Repository
bash
git clone <repository-url>
cd backend
2. Install Dependencies
bash
npm install
3. Environment Configuration
Create a .env file in the root directory:

env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edumerge
JWT_SECRET=edumerge_secret_key_2026
Environment Variables:

PORT - Server port (default: 5000)

MONGODB_URI - MongoDB connection string

JWT_SECRET - Secret key for JWT signing

4. Start MongoDB
Ensure MongoDB is running on your system:

bash
# For Linux/Mac
sudo systemctl start mongod

# For Windows (run as administrator)
net start MongoDB

# Or run MongoDB as a service
mongod
5. Run the Server
Development Mode:

bash
node index.js
Production Mode:

bash
NODE_ENV=production node index.js
6. Verify Installation
The server will start on http://localhost:5000. Test the API:

bash
curl http://localhost:5000/api/test
Expected response:

json
{ "message": "Backend is working!" }
Database Initialization
On first run, the system automatically initializes:

Default admin user (admin@edumerge.com / admin123)

Default institution (EduMerge University)

Default campus (Main Campus)

Default department (Computer Science)

Default program (Computer Science Engineering with quota configuration)

API Documentation
Base URL
text
http://localhost:5000/api
Authentication Endpoints
POST /auth/login
Login to the system

Request Body:

json
{
  "email": "admin@edumerge.com",
  "password": "admin123"
}
Response:

json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "admin@edumerge.com",
    "role": "admin"
  }
}
Dashboard Endpoints
GET /dashboard
Get dashboard statistics (Admin, Officer, Management)

Headers: Authorization: Bearer <token>

Response:

json
{
  "intake": {
    "total_intake": 100,
    "total_admitted": 45
  },
  "quotaWise": [
    {
      "quota_type": "KCET",
      "total_seats": 50,
      "filled_seats": 25
    }
  ],
  "remainingSeats": [
    {
      "program_name": "Computer Science Engineering",
      "total_intake": 100,
      "admitted": 45,
      "remaining": 55
    }
  ],
  "pendingDocuments": [...],
  "feePending": [...]
}
Master Data Endpoints
All master endpoints require authentication. Admin role required for write operations.

Institutions
Method	Endpoint	Description	Auth
POST	/masters/institutions	Create institution	Admin
GET	/masters/institutions	Get all institutions	All
GET	/masters/institutions/:id	Get institution by ID	All
PUT	/masters/institutions/:id	Update institution	Admin
DELETE	/masters/institutions/:id	Delete institution	Admin
Campuses
Method	Endpoint	Description	Auth
POST	/masters/campuses	Create campus	Admin
GET	/masters/campuses	Get all campuses	All
GET	/masters/campuses/by-institution/:institutionId	Get campuses by institution	All
GET	/masters/campuses/:id	Get campus by ID	All
PUT	/masters/campuses/:id	Update campus	Admin
DELETE	/masters/campuses/:id	Delete campus	Admin
Departments
Method	Endpoint	Description	Auth
POST	/masters/departments	Create department	Admin
GET	/masters/departments	Get all departments	All
GET	/masters/departments/by-campus/:campusId	Get departments by campus	All
GET	/masters/departments/:id	Get department by ID	All
PUT	/masters/departments/:id	Update department	Admin
DELETE	/masters/departments/:id	Delete department	Admin
Programs
Create Program Request Body:

json
{
  "departmentId": "department_object_id",
  "name": "Computer Science Engineering",
  "courseType": "UG",
  "entryType": "Regular",
  "admissionMode": "Government",
  "academicYear": "2026",
  "totalIntake": 100,
  "quotas": [
    { "type": "KCET", "totalSeats": 50 },
    { "type": "COMEDK", "totalSeats": 30 },
    { "type": "Management", "totalSeats": 20 }
  ]
}
Validation: Total seats from quotas must equal totalIntake

Applicant Endpoints
POST /applicants
Create new applicant (Admin, Officer)

Request Body:

json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "dateOfBirth": "2000-01-01",
  "category": "GM",
  "entryType": "Regular",
  "quotaType": "KCET",
  "programId": "program_object_id",
  "marksObtained": 85,
  "totalMarks": 100
}
GET /applicants
Get all applicants (Authenticated)

Response includes:

Applicant details

Program information (populated)

Document statuses

Admission status

Fee status

PATCH /applicants/:id/documents
Update document status (Public - No Auth Required)

Request Body:

json
{
  "documentType": "10th Marksheet",
  "status": "verified"
}
Document Types:

10th Marksheet

12th Marksheet

Category Certificate

Transfer Certificate

Migration Certificate

Status Values:

pending (default)

submitted

verified

PATCH /applicants/:id
Update applicant details (Admin, Officer)

Allocation Endpoints
GET /allocation/availability/:programId/:quotaType
Check seat availability (Authenticated)

Response:

json
{
  "total": 50,
  "filled": 25,
  "remaining": 25,
  "available": true
}
POST /allocation/allocate
Allocate seat to applicant (Admin, Officer)

Request Body:

json
{
  "applicantId": "applicant_object_id",
  "programId": "program_object_id",
  "quotaType": "KCET",
  "allotmentNumber": "KCET2026001"
}
Pre-checks:

Applicant status must be 'pending'

Seats must be available in the quota

Valid program and quota combination

POST /allocation/confirm/:applicantId
Confirm admission (Admin, Officer)

Pre-requisites:

Applicant status must be 'allocated'

Fee status must be 'paid'

All documents must be 'verified'

Response: Generates unique admission number

Admission Number Format:

text
{InstitutionName}/{Year}/{CourseType}/{ProgramCode}/{QuotaCode}/{Sequence}
Example: EduMerge University/2026/UG/CSE/KCET/0001
PATCH /allocation/:applicantId/fee
Update fee status (Public - No Auth Required)

Request Body:

json
{
  "feeStatus": "paid"
}
Database Schema
User Schema
javascript
{
  email: String (unique),
  passwordHash: String,
  role: ['admin', 'officer', 'management']
}
Institution Schema
javascript
{
  name: String
}
Campus Schema
javascript
{
  institutionId: ObjectId (ref: Institution),
  name: String
}
Department Schema
javascript
{
  campusId: ObjectId (ref: Campus),
  name: String
}
Program Schema
javascript
{
  departmentId: ObjectId (ref: Department),
  name: String,
  courseType: ['UG', 'PG'],
  entryType: ['Regular', 'Lateral'],
  admissionMode: ['Government', 'Management'],
  academicYear: String,
  totalIntake: Number,
  quotas: [{
    type: String,
    totalSeats: Number,
    filledSeats: Number (default: 0)
  }]
}
Applicant Schema
javascript
{
  fullName: String,
  email: String (unique),
  phone: String,
  dateOfBirth: Date,
  category: ['GM', 'SC', 'ST', 'OBC'],
  entryType: ['Regular', 'Lateral'],
  quotaType: String,
  programId: ObjectId (ref: Program),
  marksObtained: Number,
  totalMarks: Number (default: 100),
  allotmentNumber: String,
  admissionNumber: String,
  admissionStatus: ['pending', 'allocated', 'confirmed'] (default: 'pending'),
  feeStatus: ['pending', 'paid'] (default: 'pending'),
  documents: [{
    type: String,
    status: ['pending', 'submitted', 'verified'] (default: 'pending')
  }]
}
Role-Based Access Control
Role	Dashboard	Programs	Applicants	Allocation
Admin	✓	Full Access	Full Access	Full Access
Officer	✓	Read Only	Full Access	Full Access
Management	✓	-	-	-
Error Handling
The API uses centralized error handling with appropriate HTTP status codes:

Status Code	Description
200	Success
201	Created
400	Validation Error
401	Unauthorized
403	Forbidden
404	Not Found
500	Internal Server Error
Error Response Format:

json
{
  "error": "Error message",
  "details": ["Validation error details"] // Optional
}
CORS Configuration
The backend is configured to accept requests from any origin during development:

javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Security Features
Password Hashing: bcryptjs with salt rounds

JWT Authentication: 7-day token expiration

Input Validation: express-validator for all endpoints

NoSQL Injection Prevention: Mongoose schema validation

Role-Based Access: Middleware authorization

CORS Protection: Configurable origin restrictions

Testing
Test Default Admin Credentials
text
Email: admin@edumerge.com
Password: admin123
Role: admin
Test API with cURL
Login:

bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edumerge.com","password":"admin123"}'
Get Dashboard (with token):

bash
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
Create Applicant:

bash
curl -X POST http://localhost:5000/api/applicants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"fullName":"Test User","email":"test@example.com","category":"GM","entryType":"Regular","quotaType":"KCET"}'
Project Structure
text
backend/
├── src/
│   ├── config/
│   │   └── init.js              # Database initialization
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js      # Error handling middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Institution.js
│   │   ├── Campus.js
│   │   ├── Department.js
│   │   ├── Program.js
│   │   └── Applicant.js
│   └── routes/
│       ├── auth.js              # Authentication routes
│       ├── dashboard.js         # Dashboard routes
│       ├── masters.js           # Master data routes
│       ├── applicants.js        # Applicant routes
│       └── allocation.js        # Allocation routes
├── index.js                     # Application entry point
├── .env                         # Environment variables
├── package.json
└── README.md
Troubleshooting
Common Issues
1. MongoDB Connection Error

text
MongoDB connection error: MongooseServerSelectionError
Solution: Ensure MongoDB is running: mongod --version

2. Port Already in Use

text
Error: listen EADDRINUSE: address already in use :::5000
Solution: Change PORT in .env or kill process using port 5000

3. JWT Secret Missing

text
Error: secret or public key must be provided
Solution: Set JWT_SECRET in .env file

4. CORS Errors
Solution: Ensure CORS middleware is properly configured

Performance Optimization
Database Indexes: Email fields are indexed for faster queries

Population: Selective population of referenced documents

Aggregation: Used for complex analytics queries

Connection Pooling: Mongoose default connection pooling

Deployment
Deploy to Production
Set environment variables:

bash
export NODE_ENV=production
export PORT=5000
export MONGODB_URI=your_production_mongodb_uri
export JWT_SECRET=your_strong_secret_key
Use process manager (PM2):

bash
npm install -g pm2
pm2 start index.js --name edumerge-backend
pm2 save
pm2 startup
Setup reverse proxy (Nginx example):

nginx
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
Future Enhancements
Email notifications for admission confirmation

Bulk applicant import via CSV/Excel

Export reports (PDF/Excel)

Audit logging for all actions

Rate limiting for API endpoints

API versioning

Swagger/OpenAPI documentation

Unit and integration tests

Redis caching for dashboard data

WebSocket for real-time updates

Contributing
Fork the repository

Create a feature branch

Commit changes with descriptive messages

Push to the branch

Create a Pull Request

License
This project is proprietary and confidential.

Support
For technical support or queries, please contact the development team.

Note: This backend API is designed to work with the EduMerge Admission System Frontend. Ensure both services are running and properly configured for complete functionality.
