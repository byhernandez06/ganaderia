# Livestock Management System Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Firebase Integration](#firebase-integration)
4. [Features](#features)
5. [Technical Stack](#technical-stack)
6. [Directory Structure](#directory-structure)
7. [Components](#components)
8. [Authentication](#authentication)
9. [Data Models](#data-models)
10. [Installation and Setup](#installation-and-setup)
11. [Development Guidelines](#development-guidelines)

---

## Project Overview

The Livestock Management System is a comprehensive web application designed for farmers and agricultural businesses to manage their livestock, track health records, monitor production metrics, and generate reports. The system offers an intuitive user interface for daily operations and decision-making.

### Purpose
- Streamline livestock management processes
- Track animal health records and production data
- Generate reports for business insights
- Manage farm resources efficiently

---

## Architecture

The application follows a modern frontend architecture with Firebase as the backend service:

```
                  +-------------+
                  |    User     |
                  +------+------+
                         |
                         v
                  +------+------+
                  |     UI      |
                  | (React SPA) |
                  +------+------+
                         |
                         v
              +----------+-----------+
              |    React Contexts    |
              | (Auth, Farm, State)  |
              +----------+-----------+
                         |
                         v
                 +-------+--------+
                 | Firebase SDK   |
                 | Service Layer  |
                 +-------+--------+
                         |
                         v
             +-----------+-------------+
             |     Firebase Cloud      |
             | (Auth, Firestore, Storage) |
             +-------------------------+
```

---

## Firebase Integration

The system leverages Firebase services for backend functionality:

### Firebase Authentication
- User registration, login, and password recovery
- Protected routes and session management
- Role-based access control

### Firestore Database
- NoSQL database for storing all application data
- Collections for animals, health records, and production data
- Real-time updates and offline capabilities

### Firebase Storage
- Storage for images (animal photos, documents)
- Secure access control through Firebase rules

### Firebase Functions (Optional Extension)
- Server-side processing for complex operations
- Automated reporting and notifications

---

## Features

### Dashboard
- Overview of farm statistics
- Recent activities and alerts
- Performance metrics and KPIs

### Animal Management
- Comprehensive animal registry
- Individual animal profiles
- Tracking of animal lifecycle events
- Categorization and filtering options

### Health Records
- Vaccination records
- Treatment history
- Health event logging
- Medication inventory

### Production Tracking
- Milk production records
- Meat production data
- Yield analytics
- Production forecasting

### Reporting
- Customizable report generation
- Data export options
- Visual analytics and charts
- Historical data comparison

### Settings
- Farm profile management
- User preferences
- System configuration
- Notification settings

---

## Technical Stack

### Frontend
- **React**: Core UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library based on Radix UI
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **React Hook Form**: Form validation and handling

### Backend (Firebase)
- **Firebase Authentication**: User management
- **Firestore**: Database
- **Firebase Storage**: File storage
- **Firebase Security Rules**: Access control

### Build Tools
- **Vite**: Development server and bundler
- **ESLint**: Code linting
- **pnpm**: Package manager

---

## Directory Structure

```
/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components
│   │   └── auth/           # Authentication components
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── FarmContext.tsx # Farm data management
│   ├── pages/              # Route components
│   │   ├── Auth/           # Authentication pages
│   │   └── ...             # Feature pages
│   ├── lib/                # Utilities and configuration
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── utils.ts        # Helper functions
│   ├── services/           # API and service functions
│   │   ├── auth-service.ts # Authentication operations
│   │   └── firebase-service.ts # Firestore operations
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── tailwind.config.ts      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Project dependencies and scripts
```

---

## Components

### Layout Components
- **Layout**: Main application layout structure
- **Sidebar**: Navigation and user profile
- **Header**: App title, search, and actions

### Feature Components
- **AnimalCard**: Animal information display
- **HealthRecordForm**: Form for health data entry
- **ProductionChart**: Visual representation of production data
- **ReportGenerator**: Report creation interface

### UI Components
- Extensive collection of shadcn/ui components including:
  - Button, Card, Dialog, Form, Table, etc.
  - All with accessibility and theming support

---

## Authentication

The system implements a comprehensive authentication flow:

1. **User Registration**:
   - Email/password registration
   - Form validation
   - User profile creation in Firestore

2. **Login**:
   - Email/password authentication
   - Persistent sessions with tokens
   - Protected route redirection

3. **Password Reset**:
   - Email-based password recovery
   - Secure reset links

4. **Authentication State**:
   - Context-based auth state management
   - Global access to user information
   - Automatic token refresh

---

## Data Models

### Farm
```typescript
interface Farm {
  id: string;
  name: string;
  location: string;
  size: number;
  units: "acres" | "hectares";
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Animal
```typescript
interface Animal {
  id: string;
  farmId: string;
  name: string;
  species: AnimalSpecies;
  breed?: string;
  gender: "male" | "female";
  birthDate: Timestamp;
  weight?: number;
  status: "active" | "sold" | "deceased";
  identificationNumber: string;
  imageUrl?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

enum AnimalSpecies {
  Cattle = "cattle",
  Sheep = "sheep",
  Goat = "goat",
  Pig = "pig",
  Poultry = "poultry",
  Horse = "horse",
  Other = "other"
}
```

### Health Record
```typescript
interface HealthRecord {
  id: string;
  animalId: string;
  farmId: string;
  recordType: HealthRecordType;
  date: Timestamp;
  description: string;
  medication?: string;
  dosage?: string;
  veterinarian?: string;
  cost?: number;
  attachmentUrl?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

enum HealthRecordType {
  Vaccination = "vaccination",
  Treatment = "treatment",
  Examination = "examination",
  Surgery = "surgery",
  Birth = "birth",
  Other = "other"
}
```

### Production Record
```typescript
interface ProductionRecord {
  id: string;
  animalId?: string;
  farmId: string;
  productionType: ProductionType;
  date: Timestamp;
  quantity: number;
  unit: string;
  quality?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

enum ProductionType {
  Milk = "milk",
  Meat = "meat",
  Wool = "wool",
  Eggs = "eggs",
  Other = "other"
}
```

---

## Installation and Setup

### Prerequisites
- Node.js 18.0.0 or later
- pnpm 8.0.0 or later
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd livestock-management
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Firebase Setup**
   1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   2. Enable Authentication, Firestore, and Storage
   3. Create a web app in your Firebase project to get configuration
   4. Update Firebase configuration in `src/lib/firebase.ts`:
      ```typescript
      const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
      };
      ```

4. **Start the development server**
   ```bash
   pnpm run dev
   ```
   The application will be available at `http://localhost:5173`

### Production Build

1. **Build the application**
   ```bash
   pnpm run build
   ```

2. **Preview the production build**
   ```bash
   pnpm run preview
   ```

### Deployment to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**
   ```bash
   firebase init
   ```
   - Select Hosting
   - Choose your Firebase project
   - Set "dist" as the public directory
   - Configure as a single-page app

4. **Deploy to Firebase Hosting**
   ```bash
   pnpm run build
   firebase deploy
   ```

---

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use ES6+ features
- Implement React hooks pattern
- Document complex logic with comments

### Component Structure
- Functional components with hooks
- Props interface definitions
- Clear component responsibilities
- Reusable design patterns

### State Management
- Context API for global state
- React Query for server state
- Local component state when appropriate
- Optimistic UI updates

### Firebase Best Practices
- Batch write operations when possible
- Implement security rules for all collections
- Use transactions for critical operations
- Structure data for efficient querying
- Implement offline capabilities

### Form Handling
- Use React Hook Form for form validation
- Implement field-level validation
- Display clear error messages
- Prevent double submission

---

## Conclusion

This Livestock Management System provides a comprehensive solution for modern farming operations, combining ease of use with powerful features. The integration with Firebase services ensures scalability, reliability, and real-time data synchronization across devices.

For further assistance or feature requests, please contact the development team.