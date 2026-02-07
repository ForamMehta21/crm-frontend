# Real Estate CRM Frontend

A modern React-based admin panel for Real Estate CRM with Material-UI components.

## Features

- **Authentication**: JWT-based login system
- **Dashboard**: Overview with lead statistics
- **CRUD Operations**: Complete management for:
  - Property Types
  - Property Conditions
  - Landmarks
  - Leads (Buyers, Brokers, Sellers)
- **Advanced Features**:
  - Search & filtering
  - Pagination
  - Form validation with Formik & Yup
  - Protected routes
  - Redux Toolkit state management
  - Responsive Material-UI design

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

Update `.env` with your backend API URL (default is `http://localhost:5000`)

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Default Login Credentials

- Email: `admin@realestate.com`
- Password: `admin123`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner

## Tech Stack

- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Material-UI v5** - UI components
- **Formik** - Form handling
- **Yup** - Form validation
- **Axios** - HTTP client

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.js
│   └── PrivateRoute.js
├── pages/           # Page components
│   ├── Login.js
│   ├── Dashboard.js
│   ├── PropertyTypes.js
│   ├── PropertyConditions.js
│   ├── Landmarks.js
│   └── Leads.js
├── store/           # Redux store
│   ├── store.js
│   └── slices/      # Redux slices
├── App.js
└── index.js
```

## API Integration

The frontend connects to the backend API using the URL configured in the `.env` file.

**Environment Variables:**
- `REACT_APP_API_URL` - Backend API URL (default: `http://localhost:5000`)

Make sure the backend server is running before starting the frontend.

To change the API URL, update the `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```
