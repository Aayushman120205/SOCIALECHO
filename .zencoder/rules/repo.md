---
description: Repository Information Overview
alwaysApply: true
---

# SocialEcho Repository Information

## Repository Summary

SocialEcho is a **multi-project MERN stack social networking platform** with automated content moderation and context-based authentication. The repository contains three independent applications: a React frontend, a Node.js/Express backend, and a Python Flask classifier service for NLP-based content categorization.

## Repository Structure

- **`client/`**: React.js frontend application with Redux state management and Tailwind CSS styling
- **`server/`**: Node.js/Express backend with MongoDB database, JWT authentication, and admin/moderator dashboards
- **`classifier_server/`**: Python Flask service for zero-shot content classification using Hugging Face Transformers
- **`resources/`**: UI screenshots and schema diagrams
- **`.github/`**: GitHub configurations and issue templates

---

## Projects

### Client (React Frontend)

**Configuration File**: `client/package.json`

#### Language & Runtime

**Language**: JavaScript (React.js)  
**Version**: React 18.2.0  
**Package Manager**: npm  
**Build System**: Create React App (react-scripts 5.0.1)

#### Dependencies

**Main Dependencies**:
- React 18.2.0 - UI framework
- Redux & @reduxjs/toolkit - State management
- React Router 6.8.1 - Client-side routing
- Axios 1.3.3 - HTTP client
- Tailwind CSS 3.2.6 - Styling
- JWT-decode 3.1.2 - JWT token handling
- React Icons - Icon library
- React Photo View - Image viewer component
- React Spinners - Loading indicators

**Development Dependencies**:
- Tailwind CSS - Utility-first CSS framework
- PostCSS & autoprefixer - CSS processing
- Prettier - Code formatting
- Testing Library - Unit testing utilities

#### Build & Installation

```bash
cd client
npm install
npm start        # Development server on port 3000
npm run build    # Production build
npm test         # Run tests
```

#### Configuration

**Environment Variables** (`.env.example`):
- `REACT_APP_API_URL` - Backend API endpoint (default: `http://127.0.0.1:4000`)

**Main Entry Point**: `src/index.js` / `src/App.js`

---

### Server (Node.js/Express Backend)

**Configuration File**: `server/package.json`

#### Language & Runtime

**Language**: JavaScript (Node.js)  
**Runtime**: Node.js (latest LTS recommended)  
**Package Manager**: npm  
**Build System**: None (direct execution via nodemon)

#### Dependencies

**Main Dependencies**:
- Express 4.18.2 - Web framework
- Mongoose 6.9.1 - MongoDB ODM
- MongoDB 5.4.0 - Database driver
- JWT (jsonwebtoken 9.0.0) - Authentication
- Passport 0.6.0 + passport-jwt - Authentication middleware
- Bcrypt 5.1.0 - Password hashing
- Axios 1.4.0 - HTTP requests to external APIs
- Nodemailer 6.9.1 - Email service (context-based auth)
- Crypto-js 4.1.1 - Encryption (device info storage)
- Express-validator - Input validation
- Express-rate-limit - Rate limiting
- Multer 1.4.5 - File uploads
- Morgan - HTTP logging
- CORS - Cross-origin support
- Geoip-lite - IP geolocation (context-based auth)
- Express-useragent - User agent parsing

**Development Dependencies**:
- Nodemon 2.0.20 - Auto-reload during development
- Jest 27.4.5 - Testing framework
- ESLint - Code linting
- Prettier - Code formatting

#### Build & Installation

```bash
cd server
npm install
npm start          # Development server (nodemon) on port 4000
npm run production # Production server
```

#### Configuration

**Environment Variables** (`.env.example`):
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 4000)
- `CLIENT_URL` - Frontend URL for CORS
- `SECRET` & `REFRESH_SECRET` - JWT secrets
- `CRYPTO_KEY` - AES encryption key for device info
- `EMAIL`, `PASSWORD`, `EMAIL_SERVICE` - Nodemailer credentials
- `PERSPECTIVE_API_KEY` - Content moderation (spam/toxicity)
- `TEXTRAZOR_API_KEY` - Content categorization alternative
- `INTERFACE_API_KEY` - Hugging Face API key alternative
- `CLASSIFIER_API_URL` - Local Flask classifier endpoint

**Entry Point**: `server/app.js` (port 4000)

**Main Routes**:
- `/auth` - Authentication & context-based auth
- `/users` - User profiles and management
- `/posts` - Post creation, retrieval, interactions
- `/communities` - Community management
- `/admin` - Admin dashboard and moderation
- `/search` - Global search functionality
- `/assets/userFiles` & `/assets/userAvatars` - Static file serving

**Key Scripts**: `server/scripts/` directory contains:
- `create-admin.js` - Admin account creation
- `add-community.js` - Community setup
- `add-rules.js` - Community rules management
- `add-moderator.js` - Moderator assignment
- `remove-moderator.js` - Moderator removal

---

### Classifier Server (Python/Flask)

**Configuration File**: `classifier_server/requirements.txt`

#### Language & Runtime

**Language**: Python  
**Version**: Python 3.11 (slim-buster base image)  
**Package Manager**: pip  
**Framework**: Flask

#### Dependencies

**Main Dependencies**:
- Flask - Web framework
- Transformers - Hugging Face NLP library
- Torch/PyTorch - Neural network framework

**Model**: BART Large MNLI (facebook/bart-large-mnli) for zero-shot classification

#### Build & Installation

```bash
cd classifier_server
pip install -r requirements.txt
pip install torch --index-url https://download.pytorch.org/whl/cpu
python classifier_api.py  # Runs on port 5000
```

#### Docker

**Dockerfile**: `classifier_server/Dockerfile`

**Image Setup**:
- Base: `python:3.11-slim-buster`
- Working Directory: `/app`
- Exposed Port: `5000`
- Startup Command: `python classifier_api.py`

**Build & Run**:
```bash
docker build -t socialecho-classifier:latest .
docker run -p 5000:5000 socialecho-classifier:latest
```

#### Configuration

**Entry Point**: `classifier_api.py`

**API Endpoints**:
- `GET /` - Health check
- `POST /classify` - Content classification

**Classification Categories** (18 labels):
- Programming, Health & Fitness, Travel, Food & Cooking, Music, Sports, Fashion
- Art & Design, Business, Education, Photography, Gaming, Science & Technology
- Parenting, Politics, Environment, Beauty & Skincare, Literature

**Request Format**:
```json
{
  "text": "Content to classify"
}
```

---

## Testing & Validation

### Server Testing

**Framework**: Jest 27.4.5  
**Status**: Configured but no active test suite specified  
**Command**: `npm test` (would need custom configuration)

### Validation & Operations

**Admin Setup Script**: `./server/admin_tool.sh`
- Menu-driven CLI for initialization
- Creates admin accounts
- Sets up communities and rules
- Assigns moderators

**Health Check**:
```bash
curl http://localhost:4000/server-status
```

---

## Key Configuration Files

**Environment Setup**:
- `client/.env.example` - Frontend configuration template
- `server/.env.example` - Backend configuration template

**Build Configuration**:
- `client/tailwind.config.js` - Tailwind CSS customization
- `client/postcss.config.js` - PostCSS plugins
- `server/package.json` - Scripts and dependencies

---

## Architecture Highlights

**Authentication**: JWT-based with Passport.js  
**Authorization**: Three roles (Admin, Moderator, User)  
**Content Moderation**: Perspective API + TextRazor API + Local Flask classifier  
**Context-Based Auth**: IP, device, location tracking with AES encryption  
**Database**: MongoDB with Mongoose ODM  
**Storage**: Azure Blob Storage for media files  
**Styling**: Tailwind CSS + PostCSS
