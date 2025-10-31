# Yashica Excel Analytics Platform

A full-stack web application built with the MERN stack that transforms Excel data into interactive visualizations. This project was created as part of my skill development journey and turned out to be quite an interesting challenge!

## 🎯 What This Does

Essentially, this platform lets users upload Excel files (.xlsx/.xls) and automatically generates interactive charts and graphs from the data. Think of it as a way to make boring spreadsheet data actually visually interesting and useful for presentations.

## ✨ Key Features

### Core Functionality
- **Excel File Upload**: Drag and drop interface for .xlsx and .xls files
- **Data Processing**: Automatically parses Excel data and identifies data types
- **Interactive Charts**: Various 2D and 3D visualizations (Line, Bar, Pie, Scatter, Area, Bubble charts)
- **Real-time Analytics**: Basic statistical calculations like mean, median, standard deviation
- **User Dashboard**: Personal workspace to manage uploaded files and analyses
- **Role-based Access**: Standard user vs admin permissions

### The Fancy Stuff
- **Chart Customization**: Change themes, colors, animations, and export options
- **Data Export**: Download charts as PNG, PDF, or SVG formats
- **Responsive Design**: Works on mobile devices with dark/light mode toggle
- **File Management**: Keeps track of upload history and file metadata
- **Admin Panel**: Basic admin interface for user management and system overview

## 🛠️ Tech Stack (What I Used)

### Backend Technologies
- **Node.js** - The runtime environment
- **Express.js** - Web framework (pretty standard choice)
- **MongoDB** - Database (decided to go with Mongoose ODM)
- **JWT** - For authentication (secure but straightforward)
- **Multer** - Handles file uploads
- **XLSX** - Parses Excel files
- **Chart.js** - Generates the charts

### Frontend Stack
- **React.js** - User interface library
- **Material-UI** - Component library (makes things look professional)
- **React Router** - Handles navigation between pages
- **Axios** - HTTP client for API calls
- **Chart.js & React-Chartjs-2** - Data visualization libraries
- **Three.js** - For those 3D visualizations
- **Framer Motion** - Adds smooth animations (users seem to like this)
- **React Query** - Handles data fetching and caching

### Development Tools
- **Nodemon** - Automatically restarts the server during development
- **ESLint** - Keeps code clean and consistent
- **Prettier** - Code formatting (helps with team collaboration)
- **Jest** - Testing framework

## 🚀 Getting Started

### What You'll Need
- Node.js (version 16 or higher - this project uses some ES2020 features)
- MongoDB (either local installation or MongoDB Atlas)
- npm or yarn package manager

### Setup Process

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/excel-analytics-platform.git
   cd excel-analytics-platform
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   cp misc/.env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/excel_analytics
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the development servers**
   
   **Option 1: Run both frontend and backend together:**
   ```bash
   npm run dev
   ```
   
   **Option 2: Run them separately (useful for debugging):**
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
excel-analytics-platform/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Generic components
│   │   │   └── layout/         # Layout components
│   │   ├── contexts/           # React contexts for state
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin-specific pages
│   │   │   └── user/           # User-specific pages
│   │   ├── services/           # API service functions
│   │   └── utils/              # Utility functions
│   └── package.json
├── controllers/             # Express route controllers
├── middleware/              # Express middleware
├── models/                  # MongoDB/Mongoose models
├── routes/                  # API route definitions
├── services/                # Business logic services
├── utils/                   # Backend utility functions
├── uploads/                 # User uploaded files
├── server.js                # Main application entry point
└── package.json
```

## 🔌 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### File Management
- `POST /api/files/upload` - Upload Excel file
- `GET /api/files` - Get user's uploaded files
- `GET /api/files/:id` - Get specific file details
- `GET /api/files/:id/data` - Get file content data
- `DELETE /api/files/:id` - Delete file

### Analytics & Charts
- `POST /api/analytics` - Create new analysis
- `GET /api/analytics` - Get user's analyses
- `GET /api/analytics/:id` - Get specific analysis
- `PUT /api/analytics/:id` - Update analysis
- `DELETE /api/analytics/:id` - Delete analysis

### Admin Panel
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id` - Update user status
- `DELETE /api/admin/users/:id` - Remove user account

## 📦 Code Examples

### User Registration Example
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    password: 'StrongPassword123!'
  })
});

const userData = await response.json();
console.log('User created:', userData);
```

### File Upload with Progress Tracking
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: formData,
  onUploadProgress: (progressEvent) => {
    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    console.log(`Upload progress: ${progress}%`);
  }
});
```

### Creating a Sales Analysis Chart
```javascript
const salesAnalysis = {
  title: 'Q4 2024 Sales Performance',
  fileId: 'file_123abc',
  configuration: {
    selectedSheet: 'Sales Data',
    xAxis: { column: 'Month', label: 'Month' },
    yAxis: { column: 'Revenue', label: 'Revenue ($)' },
    chartType: 'line'
  }
};

const response = await fetch('/api/analytics', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(salesAnalysis)
});
```

## 🛠️ Configuration Details

### Environment Variables

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/excel_analytics

# Authentication Settings
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# File Upload Limits
MAX_FILE_SIZE=50000000
ALLOWED_FILE_TYPES=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel

# Rate Limiting Settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### MongoDB Setup Options

**Local MongoDB Installation:**
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify it's running
sudo systemctl status mongod
```



## 📊 Project Features Deep Dive

### Data Processing Pipeline
The system automatically:
- Parses Excel files and detects column types
- Handles multiple sheets in a single file
- Performs basic data cleaning (removes empty rows/columns)
- Generates summary statistics (mean, median, mode, standard deviation)
- Validates data before chart generation

### Chart Types & Customization
**2D Charts Available:**
- Line charts (great for time series data)
- Bar charts (good for comparisons)
- Pie charts (percentage distributions)
- Scatter plots (correlation analysis)
- Area charts (cumulative data)
- Bubble charts (three-dimensional data)
- Radar charts (multi-dimensional comparison)

**3D Visualizations:**
- 3D scatter plots
- 3D surface plots
- 3D bar charts

**Customization Options:**
- Color themes (light, dark, custom palettes)
- Chart animations
- Interactive tooltips
- Zoom and pan functionality
- Legend positioning
- Export formats (PNG, PDF, SVG)

### User Management System
- Secure JWT-based authentication
- Role-based access control (User/Admin)
- User profiles with preferences
- Activity logging and tracking
- File storage quotas per user

### Admin Features
- System-wide user management
- File and analysis oversight
- Basic performance monitoring
- Usage analytics and statistics
- User activity monitoring


### Environment-Specific Configurations

**Development:**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/excel_analytics_dev
LOG_LEVEL=debug
```


## 🔒 Security Implementation

- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Admin and user role separation
- **Input Validation**: Server-side validation for all inputs
- **File Security**: Type and size validation for uploads
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Proper cross-origin resource sharing
- **Security Headers**: Helmet.js for Express security
- **Password Security**: Bcrypt hashing for password storage

## 🧪 Testing Approach

```bash
# Run all tests
npm test

# Run tests in watch mode for development
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests only
```


### File Upload Troubleshooting
- **Issue**: Large files fail to upload
- **Solution**: Check `MAX_FILE_SIZE` in .env file (default: 50MB)
- **Issue**: File type not supported
- **Solution**: Ensure file is .xlsx or .xls format
- **Issue**: Upload directory not writable
- **Solution**: Check permissions on uploads/ directory

### Frontend Build Issues
```bash
# Clear npm cache and reinstall dependencies
npm cache clean --force
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
npm install
cd client && npm install && cd ..
```

### CORS Configuration Issues
- **Symptom**: API calls fail with CORS errors
- **Solution**: Verify `CLIENT_URL` in .env matches your frontend URL
- **Solution**: Check CORS configuration in server.js

## 🤝 Contributing Guidelines

I welcome contributions! Here's how to get started:

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/amazing-new-feature`
3. **Make your changes** and commit them with descriptive messages
4. **Run tests** to ensure everything works: `npm test`
5. **Submit a pull request** with a clear description of your changes

### Development Best Practices
- Follow the existing ESLint configuration
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages (feat:, fix:, docs:, etc.)
- Keep code clean and well-commented

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Credits & Acknowledgments

This project wouldn't have been possible without these amazing tools and communities:

- **Chart.js** - The charting library that makes everything look beautiful
- **Material-UI** - React components that save tons of development time
- **Three.js** - Makes 3D visualizations actually manageable
- **MongoDB** - Flexible database that's perfect for this use case
- **Express.js** - Reliable web framework that just works
- **React.js** - The frontend library that makes building UIs enjoyable

**Special thanks** to Zidio Development for providing this challenge. It was exactly the kind of project I needed to level up my full-stack development skills and learn some new technologies in the process.

## 📞 Support & Contact

Need help or have questions? Here's how to reach out:

- **GitHub Issues**: Create an issue in this repository
- **Email**: yashica.nagal5@gmail.com (I try to respond within 24-48 hours)
- **Documentation**: Check the docs/ folder for detailed guides

---

**About the Author**

Hi, I'm Yashica Nagal! This Excel Analytics Platform was developed as part of a full-stack development challenge provided by Zidio Development. The assignment(Internship Project) focused on creating a comprehensive web application that demonstrates proficiency in modern web technologies and data visualization techniques.

Through this project, I gained hands-on experience with the MERN stack, Excel file processing, interactive charting libraries, and user authentication systems. The challenge required implementing everything from basic file uploads to complex 3D data visualizations, which pushed me to explore new technologies and solve real-world problems in data analysis.

**Project Scope & Learning Objectives:**
- Master Excel file processing in a web environment
- Implement robust data visualization capabilities
- Build secure user authentication and role-based access
- Create responsive, modern user interfaces
- Develop full-stack applications with proper API design

When I'm not working on development challenges like this, I'm actively exploring emerging web technologies and contributing to open-source projects. This challenge from Zidio Development was instrumental in strengthening my full-stack development skills and understanding of modern data visualization approaches.

Feel free to connect and discuss the implementation details or share insights about similar challenges!

---

**This project was completed as part of a development skills assessment and represents practical application of full-stack development principles.**

---

*This project was built with passion and lots of coffee ☕*
