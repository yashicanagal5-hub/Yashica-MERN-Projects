Yashica -Excel Analytics Platform
A comprehensive full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that transforms Excel data into interactive visualizations and insights.

✨ Features
Core Functionality
Excel File Upload: Support for .xlsx and .xls files with drag-and-drop interface
Data Processing: Automatic parsing and analysis of Excel data
Interactive Charts: 2D and 3D visualizations (Line, Bar, Pie, Scatter, Area, Bubble, etc.)
Real-time Analytics: Statistical calculations and data insights
User Dashboard: Personal analytics history and file management
Role-based Access: User and Admin roles with appropriate permissions
Advanced Features
Chart Customization: Themes, colors, animations, and export options
Data Export: Download charts as PNG, PDF, SVG formats
Responsive Design: Mobile-friendly interface with dark/light mode
File Management: Upload history, metadata tracking, and storage monitoring
Admin Panel: User management, system analytics, and platform oversight
Modern UI: Material-UI components with smooth animations


📚 Technology Stack
Backend
Node.js - Runtime environment
Express.js - Web application framework
MongoDB - Database with Mongoose ODM
JWT - Authentication and authorization
Multer - File upload handling
XLSX - Excel file processing
Chart.js - Chart generation

Frontend
React.js - User interface library
Material-UI - Component library
React Router - Navigation
Axios - HTTP client
Chart.js & React-Chartjs-2 - Data visualization
Three.js - 3D visualizations
Framer Motion - Animations
React Query - Data fetching
Development Tools
Nodemon - Development server
ESLint - Code linting
Prettier - Code formatting
Jest - Testing framework

🚀 Quick Start
Prerequisites
Node.js (v16 or higher)
MongoDB (local installation or MongoDB Atlas)
npm or yarn package manager

Installation
1. Clone the repository
bash
git clone <repository-url>
cd excel-analytics-platform
3.
Install backend dependencies
bash
npm install
4.
Install frontend dependencies
bash
cd client
npm install
cd ..
5.
Setup environment variables
bash
cp misc/.env.example .env
Edit .env file with your configuration:
env
MONGODB_URI=mongodb://localhost:27017/excel_analytics
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
6.
Start the application
Development mode (both frontend and backend):
bash
npm run dev
Or start separately:
bash
# Backend (Terminal 1)
npm run server

# Frontend (Terminal 2)
npm run client
6.
Access the application
Frontend: http://localhost:3000
Backend API: http://localhost:5000
📁 Project Structure
excel-analytics-platform/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin pages
│   │   │   └── ...
│   │   ├── services/           # API services
│   │   └── utils/              # Utility functions
│   └── package.json
├── controllers/             # Route controllers
├── middleware/              # Express middleware
├── models/                  # MongoDB models
├── routes/                  # API routes
├── services/                # Business logic
├── utils/                   # Backend utilities
├── uploads/                 # File uploads
├── server.js                # Entry point
└── package.json


🔌 API Endpoints
Authentication
POST /api/auth/register - User registration
POST /api/auth/login - User login
GET /api/auth/profile - Get user profile
PUT /api/auth/profile - Update user profile
POST /api/auth/change-password - Change password
Files
POST /api/files/upload - Upload Excel file
GET /api/files - Get user files
GET /api/files/:id - Get file details
GET /api/files/:id/data - Get file data
DELETE /api/files/:id - Delete file
Analytics
POST /api/analytics - Create analysis
GET /api/analytics - Get user analyses
GET /api/analytics/:id - Get analysis details
PUT /api/analytics/:id - Update analysis
DELETE /api/analytics/:id - Delete analysis
Admin
GET /api/admin/dashboard/stats - Dashboard statistics
GET /api/admin/users - Get all users
PUT /api/admin/users/:id - Update user
DELETE /api/admin/users/:id - Delete user
📦 Usage Examples
1. User Registration
javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});
2. File Upload
javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
3. Create Analysis
javascript
const analysis = {
  title: 'Sales Analysis',
  fileId: 'file_id_here',
  configuration: {
    selectedSheet: 'Sheet1',
    xAxis: { column: 'Date', label: 'Date' },
    yAxis: { column: 'Sales', label: 'Sales Amount' },
    chartType: 'line'
  }
};


🛠️ Configuration
Environment Variables
env
# Database
MONGODB_URI=mongodb://localhost:27017/excel_analytics

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=50000000
ALLOWED_FILE_TYPES=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MongoDB Setup
Local MongoDB:

bash
# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
MongoDB Atlas (Cloud):

1.Create account at https://cloud.mongodb.com
2.Create new cluster
3.Get connection string
4.Update MONGODB_URI in .env file

📊 Features in Detail
Data Processing
Automatic Excel file parsing
Data type detection (numeric, text, date, boolean)
Statistical analysis (mean, median, mode, standard deviation)
Data cleaning and validation
Support for multiple sheets
Visualization Options
2D Charts: Line, Bar, Pie, Scatter, Area, Bubble, Radar, Doughnut
3D Charts: Surface plots, 3D scatter, 3D bar charts
Customization: Colors, themes, animations, legends
Interactive: Zoom, pan, hover tooltips
Export: PNG, PDF, SVG formats
User Management
Secure authentication with JWT
Role-based access control
User profiles and preferences
Activity tracking
Storage quota management
Admin Features
System-wide analytics
User management interface
File and analysis oversight
Performance monitoring
Data usage statistics


env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/excel_analytics_dev
Production:

env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/excel_analytics

🔒 Security Features
Authentication: JWT-based secure authentication
Authorization: Role-based access control
Input Validation: Server-side validation for all inputs
File Security: File type and size validation
Rate Limiting: API rate limiting to prevent abuse
CORS: Configured Cross-Origin Resource Sharing
Helmet: Security headers for Express
Password Hashing: Bcrypt for secure password storage

📋 Testing
bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration

🗺️ Roadmap
Phase 1 (Current)
✅ Basic Excel file upload and processing
✅ 2D chart generation
✅ User authentication and profiles
✅ Admin dashboard
✅ Responsive UI
Phase 2 (Planned)
☐ 3D visualization enhancements
☐ AI-powered insights
☐ Real-time collaboration
☐ Advanced export options
☐ API integrations
Phase 3 (Future)
☐ Machine learning predictions
☐ Custom dashboard creation
☐ Multi-tenant architecture
☐ Mobile applications
☐ Enterprise features


🐛 Troubleshooting
Common Issues
1. MongoDB Connection Error
bash
# Check if MongoDB is running
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
2. File Upload Issues

Check file size limits in configuration
Verify file types are supported (.xlsx, .xls)
Ensure uploads directory exists and has write permissions

3. Frontend Build Errors
bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

4. CORS Issues
Verify CLIENT_URL in .env file
Check CORS configuration in server.js

🤝 Contributing
1.Fork the repository
2.Create feature branch (git checkout -b feature/AmazingFeature)
3.Commit changes (git commit -m 'Add AmazingFeature')
4.Push to branch (git push origin feature/AmazingFeature)
5.Open Pull Request

Development Guidelines
1. Follow ESLint configuration
2. Write tests for new features
3. Update documentation
4. Use conventional commit messages

📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Chart.js - Beautiful charts for JavaScript
Material-UI - React components library
Three.js - 3D graphics library
MongoDB - Database platform
Express.js - Web framework
React.js - Frontend library
Open source contributors for the libraries used in this project
Zidio Development for providing this opportunity/task challenge that helped me a lot to polish my skills.

👤 Author
Yashica Nagal
Feel free to reach out for questions or collaboration opportunities!


📞 Support
For support and questions:
Create an issue in the repository
Email: yashicanagal5@gmail.com


Built with ❤️ by Yashica Nagal

Transform your Excel data into insights with ease!
