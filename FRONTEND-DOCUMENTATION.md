# Frontend Documentation - Real Estate CRM

## Overview

The frontend is a **React** single-page application (SPA) that provides a modern Material UI-based interface for managing real estate CRM operations. It uses **Redux Toolkit** for state management and is deployed on **Firebase Hosting**.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI library |
| Material UI (MUI 5) | Component library & styling |
| Redux Toolkit | State management |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Formik + Yup | Form handling & validation |
| Redux Persist | Persist state across sessions |
| Day.js | Date handling |
| Firebase Hosting | Deployment |

---

## Project Structure

```
frontend/
├── public/
│   ├── icons/                 # App icons (PWA)
│   ├── index.html             # HTML entry point
│   ├── manifest.json          # PWA manifest
│   └── service-worker.js      # Service worker for offline support
├── src/
│   ├── components/
│   │   ├── Layout.js          # Main layout with sidebar navigation
│   │   ├── LeadImport.js      # Excel lead import component
│   │   └── PrivateRoute.js    # Auth-protected route wrapper
│   ├── pages/
│   │   ├── Login.js           # Login page
│   │   ├── Dashboard.js       # Main dashboard with analytics
│   │   ├── Leads.js           # Lead listing with filters
│   │   ├── LeadForm.js        # Create/edit lead form
│   │   ├── LeadView.js        # Lead detail view
│   │   ├── FBAdsLeads.js      # Facebook Ads leads management
│   │   ├── Builders.js        # Builder listing
│   │   ├── BuilderForm.js     # Create/edit builder form
│   │   ├── Investors.js       # Investor listing
│   │   ├── InvestorForm.js    # Create/edit investor form
│   │   ├── Landmarks.js       # Landmark management
│   │   ├── PropertyTypes.js   # Property type management
│   │   ├── PropertyConditions.js # Property condition management
│   │   ├── Users.js           # User management
│   │   └── UserForm.js        # Create/edit user form
│   ├── store/
│   │   ├── store.js           # Redux store configuration
│   │   ├── storeAccessor.js   # Store accessor utility
│   │   └── slices/
│   │       ├── authSlice.js            # Authentication state
│   │       ├── leadSlice.js            # Lead CRUD state
│   │       ├── leadImportExportSlice.js # Import/export state
│   │       ├── builderSlice.js         # Builder state
│   │       ├── investorSlice.js        # Investor state
│   │       ├── landmarkSlice.js        # Landmark state
│   │       ├── propertyTypeSlice.js    # Property type state
│   │       ├── propertyConditionSlice.js # Property condition state
│   │       └── userSlice.js            # User management state
│   ├── theme/                 # MUI theme customization
│   ├── utils/
│   │   ├── api.js             # Axios instance & interceptors
│   │   └── tokenUtils.js     # JWT token utilities
│   ├── App.js                 # Root component with routes
│   ├── index.js               # React entry point
│   └── index.css              # Global styles
├── .env.example               # Environment variable template
├── .firebaserc                # Firebase project config
├── firebase.json              # Firebase hosting config
├── package.json               # Dependencies & scripts
└── README.md                  # Setup instructions
```

---

## Pages & Features

### Login
- JWT-based authentication
- Token stored via Redux Persist
- Auto-redirect if already authenticated

### Dashboard
- Analytics overview with stats cards
- Lead status distribution
- Recent activity feed

### Leads Management
- Filterable and searchable lead table
- Create/edit leads with multi-field form
- Lead status tracking (New → Contacted → Follow-up → Converted/Lost)
- Excel import/export functionality
- Facebook Ads leads integration

### Builders
- Builder listing with search
- Create/edit builder profiles with project details

### Investors
- Investor directory
- Create/edit investor profiles

### Landmarks
- Landmark management for property location references

### Property Types & Conditions
- Configurable property types (Apartment, Villa, Plot, etc.)
- Configurable property conditions (New, Resale, Under Construction, etc.)

### User Management
- Admin can create/manage team users
- Role-based access control

---

## State Management

Redux Toolkit slices handle all API interactions:

| Slice | Responsibilities |
|---|---|
| `authSlice` | Login, logout, token management |
| `leadSlice` | Lead CRUD, filtering, pagination |
| `leadImportExportSlice` | Excel import/export operations |
| `builderSlice` | Builder CRUD |
| `investorSlice` | Investor CRUD |
| `landmarkSlice` | Landmark CRUD |
| `propertyTypeSlice` | Property type CRUD |
| `propertyConditionSlice` | Property condition CRUD |
| `userSlice` | User management CRUD |

---

## API Configuration

The API base URL is configured via environment variable:

```env
REACT_APP_API_URL=http://localhost:5000
```

The `src/utils/api.js` file creates an Axios instance with:
- Base URL from environment
- JWT token injection via interceptors
- Error response handling

---

## Routing

All routes are protected via `PrivateRoute` component (requires authentication):

| Path | Page |
|---|---|
| `/login` | Login |
| `/` | Dashboard |
| `/leads` | Leads listing |
| `/leads/new` | Create lead |
| `/leads/:id` | View lead |
| `/leads/:id/edit` | Edit lead |
| `/fb-ads-leads` | Facebook Ads leads |
| `/builders` | Builders listing |
| `/builders/new` | Create builder |
| `/builders/:id/edit` | Edit builder |
| `/investors` | Investors listing |
| `/investors/new` | Create investor |
| `/investors/:id/edit` | Edit investor |
| `/landmarks` | Landmarks |
| `/property-types` | Property types |
| `/property-conditions` | Property conditions |
| `/users` | Users listing |
| `/users/new` | Create user |
| `/users/:id/edit` | Edit user |

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start development server (port 3000) |
| `npm run build` | Create production build |
| `npm test` | Run tests |

---

## Environment Variables

Create a `.env` file in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000
```

For production, set this to your deployed backend URL.

---

## Deployment

The frontend is deployed on **Firebase Hosting**:
- Project: `crm-realestate-737a2`
- URL: `https://crm-realestate-737a2.web.app`

Build and deploy:
```bash
npm run build
firebase deploy --only hosting
```

---

## PWA Support

The app includes:
- `manifest.json` for installability
- `service-worker.js` for offline caching
- App icons in `public/icons/`
