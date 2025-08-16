# Natours 🌍

A modern, feature-rich tour booking application built with Node.js, Express, and MongoDB. This project demonstrates advanced backend development concepts including authentication, authorization, data modeling, and API design.

## 🚀 Features

### Core Functionality
- **Tour Management**: Complete CRUD operations for tours
- **User Authentication**: Secure signup, login, and password management
- **Authorization**: Role-based access control (user, guide, lead-guide, admin)
- **Password Security**: Bcrypt hashing and password reset functionality
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Global error handling with custom error classes

### Advanced Features
- **API Features**: Filtering, sorting, field limiting, and pagination
- **Aggregation Pipeline**: Tour statistics and monthly planning
- **Middleware**: Custom middleware for authentication and data processing
- **Email Integration**: Password reset emails via Nodemailer
- **Security**: JWT-based authentication with token expiration
- **Data Modeling**: Advanced MongoDB schemas with validation

## 🛠️ Tech Stack

- **Runtime**: Node.js (>=10.0.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **Validation**: Validator.js
- **Development**: Morgan (logging), ESLint, Prettier

## 📁 Project Structure

```
natours/
├── controllers/          # Route handlers and business logic
│   ├── auth-controller.js    # Authentication logic
│   ├── error-controller.js  # Global error handling
│   ├── tour-controller.js   # Tour CRUD operations
│   └── user-controller.js   # User management
├── models/              # Database schemas
│   ├── tour-model.js        # Tour data model
│   └── user-model.js        # User data model
├── routes/              # API route definitions
│   ├── tour-route.js        # Tour endpoints
│   └── user-route.js        # User endpoints
├── utils/               # Utility functions
│   ├── api-features.js      # Query features (filter, sort, paginate)
│   ├── app-error.js         # Custom error class
│   ├── catch-async.js       # Async error handling wrapper
│   ├── email.js             # Email functionality
│   └── filterObj.js         # Object filtering utility
├── dev-data/            # Development data and templates
│   ├── data/               # Sample JSON data
│   ├── img/                # Sample images
│   └── templates/          # Email templates
├── public/              # Static assets
│   ├── css/                # Stylesheets
│   ├── img/                # Images
│   └── *.html              # Static HTML files
├── app.js               # Express app configuration
├── server.js            # Server startup and database connection
└── package.json         # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites
- Node.js (version 10.0.0 or higher)
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd natours
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=mongodb://localhost:27017/natours
   JWT_SECRET=your-super-secure-jwt-secret
   JWT_EXPIRES_IN=90d
   EMAIL_FROM=noreply@natours.com
   ```

4. **Import sample data (optional)**
   ```bash
   node dev-data/data/import-dev-data.js --import
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run start:prod
   
   # Debug mode
   npm run debug
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/signup` | Register new user |
| POST | `/users/login` | User login |
| POST | `/users/forgotPassword` | Request password reset |
| PATCH | `/users/resetPassword/:token` | Reset password with token |
| PATCH | `/users/updateMyPassword` | Update current user password |

### Tour Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tours` | Get all tours | ✅ |
| GET | `/tours/:id` | Get single tour | ❌ |
| POST | `/tours` | Create new tour | ❌ |
| PATCH | `/tours/:id` | Update tour | ❌ |
| DELETE | `/tours/:id` | Delete tour | ✅ (Admin/Lead-guide) |
| GET | `/tours/top-5-cheap` | Get top 5 cheap tours | ❌ |
| GET | `/tours/tour-stats` | Get tour statistics | ❌ |
| GET | `/tours/monthly-plan/:year` | Get monthly tour plan | ❌ |

### User Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | ❌ |
| GET | `/users/:id` | Get single user | ❌ |
| PATCH | `/users/updateMe` | Update current user | ✅ |
| DELETE | `/users/deleteMe` | Deactivate current user | ✅ |

### Query Features
The API supports advanced querying:

```bash
# Filtering
GET /api/v1/tours?difficulty=easy&price[lt]=500

# Sorting
GET /api/v1/tours?sort=-ratingsAverage,price

# Field limiting
GET /api/v1/tours?fields=name,duration,difficulty,price

# Pagination
GET /api/v1/tours?page=2&limit=10
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Password Reset**: Secure token-based password reset
- **Role-based Authorization**: Different access levels
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Secure error responses

## 🧪 Development

### Code Quality
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Code formatting
- **Pre-commit hooks**: Code quality enforcement

### Scripts
```bash
npm start          # Production server
npm run start:dev  # Development with auto-reload
npm run start:prod # Production mode
npm run debug      # Debug mode with ndb
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**@h3nrzi** - Learning Node.js, Express, and MongoDB

---

*This project is part of a Node.js learning journey, focusing on backend development best practices and modern web application architecture.*