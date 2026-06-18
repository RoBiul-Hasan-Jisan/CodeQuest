# English Learning Platform - Setup Guide

## Overview
This is a fully dynamic, production-ready English learning platform with Firebase authentication and MongoDB data storage.

## Features
- User authentication (Sign up / Sign in) with Firebase
- Dynamic user profiles and progress tracking
- Multiple learning modules:
  - AI English Tutor (interactive chat)
  - Vocabulary Builder (flashcard system)
  - Grammar Lab (interactive exercises)
  - Writing Assistant (real-time feedback)
  - Speaking Practice (pronunciation training)
  - Progress Analytics (comprehensive metrics)

## Technology Stack
- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, Framer Motion
- **Authentication**: Firebase Auth
- **Database**: MongoDB
- **State Management**: Zustand + React Context
- **UI Components**: Shadcn UI
- **Charts**: Recharts

## Environment Setup

### 1. Firebase Configuration
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Email/Password Authentication
3. Get your Firebase config credentials
4. Add environment variables to your project:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_ADMIN_SDK_KEY=your_admin_sdk_json
```

### 2. MongoDB Setup
1. Create a MongoDB Atlas cluster at [mongodb.com](https://mongodb.com)
2. Create a database user with appropriate permissions
3. Add your IP address to the access list
4. Get your connection string
5. Add to environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.wavblr6.mongodb.net/?appName=Cluster0
```

## Database Schema

### Users Collection
```
{
  uid: string (Firebase UID),
  email: string,
  displayName: string,
  createdAt: Date,
  updatedAt: Date,
  profile: {
    streak: number,
    totalXP: number,
    wordsLearned: number,
    lessonsCompleted: number,
    proficiencyLevel: string,
    targetLevel: string
  },
  stats: {
    totalStudyTime: number,
    weeklyStudyTime: Array<{day: string, hours: number}>,
    monthlyProgress: Array<{month: string, progress: number}>,
    achievements: Array<{id: string, name: string, icon: string}>
  }
}
```

## File Structure
```
/app
  /api
    /auth
      /signup          - User registration endpoint
    /user
      /profile         - Get/update user profile
  /auth
    /login            - Login page
    /signup           - Signup page
  /dashboard
    /                 - Dashboard home
    /tutor            - AI Tutor page
    /vocabulary       - Vocabulary builder
    /grammar          - Grammar lab
    /writing          - Writing assistant
    /speaking         - Speaking practice
    /analytics        - Progress analytics
  /layout.tsx         - Root layout with providers
  /page.tsx           - Landing page

/components
  /dashboard          - Dashboard components
  /sections           - Landing page sections
  /tutor              - Tutor components
  /protected-route.tsx - Route protection wrapper
  /theme-provider.tsx - Theme context provider
  /ui                 - Shadcn UI components

/lib
  /firebase.ts        - Firebase configuration
  /mongodb.ts         - MongoDB connection
  /auth.ts            - Authentication utilities
  /store.ts           - Zustand store
  /user-context.tsx   - User context provider
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
  - Body: `{ uid, email, displayName }`
  - Returns: User document with initial profile

### User Profile
- `GET /api/user/profile` - Fetch user profile
  - Headers: `Authorization: Bearer {token}`
  - Returns: User document

- `PUT /api/user/profile` - Update user profile
  - Headers: `Authorization: Bearer {token}`
  - Body: Partial user document
  - Returns: Updated user document

## Authentication Flow

1. **Signup**
   - User fills signup form with email, password, display name
   - Firebase creates user account
   - Backend creates MongoDB document
   - Auth token stored in localStorage
   - User redirected to dashboard

2. **Login**
   - User enters email and password
   - Firebase authenticates credentials
   - Auth token stored in localStorage
   - User redirected to dashboard

3. **Protected Routes**
   - Dashboard routes wrapped with `ProtectedRoute` component
   - Checks for valid auth token on mount
   - Redirects to login if not authenticated

## Running Locally

```bash
# Install dependencies
pnpm install

# Set environment variables
# Copy .env.example to .env.local and fill in values

# Run development server
pnpm dev

# Open browser
open http://localhost:3000
```

## Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### MongoDB Considerations
- Ensure your IP whitelist is configured for production IPs
- Set up appropriate indexes for performance
- Regular backups are recommended

## Security Best Practices

1. **Firebase Admin SDK**
   - Store admin SDK key securely as server-side environment variable
   - Never expose in frontend code

2. **MongoDB Connection**
   - Use strong passwords for database users
   - Limit permissions to necessary collections
   - Regular password rotation recommended

3. **Rate Limiting**
   - Consider implementing rate limiting for API endpoints
   - Especially for authentication endpoints

4. **CORS**
   - Configure CORS for production domains only

## Troubleshooting

### Firebase Connection Issues
- Verify API keys are correct
- Check Firebase project settings
- Ensure email/password auth is enabled

### MongoDB Connection Issues
- Verify connection string is correct
- Check IP whitelist includes your address
- Verify database user has appropriate permissions

### Authentication Issues
- Clear localStorage if tokens are stale
- Check browser console for error messages
- Verify environment variables are set correctly

## Next Steps

1. Customize learning content and exercises
2. Implement AI Tutor with actual LLM integration
3. Add progress tracking and notifications
4. Implement social features (friend connections, competition)
5. Add payment system for premium features
6. Set up analytics and monitoring

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Review MongoDB documentation
4. Check Next.js documentation
