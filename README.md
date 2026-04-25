# AdaptLearn AI

AdaptLearn AI is an intelligent web application built to help users learn new concepts effectively. It personalizes content and adapts to user pace and understanding using Google Gemini AI, Firebase Auth, and Firestore.

## Features
- **User Authentication**: Secure sign-in with Google and Email/Password via Firebase.
- **Adaptive Learning Engine**: Break concepts into micro-lessons powered by Gemini AI.
- **Visual Progress Tracking**: Real-time charts for mastery levels using Recharts.
- **Personalized Quizzes**: Automatically generated quizzes to assess knowledge and adapt the learning curve.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Account
- Google Gemini API Key

### 1. Firebase Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project named **AdaptLearn AI**.
2. Add a **Web App** to the project to get your Firebase config object.
3. Enable **Authentication**:
   - Go to Build > Authentication > Get Started.
   - Enable **Email/Password** provider.
   - Enable **Google** provider.
4. Enable **Firestore Database**:
   - Go to Build > Firestore Database > Create database.
   - Start in **Test mode** (we will define security rules later).

### 2. Google Gemini API Setup
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Generate an API Key.

### 3. Environment Variables
Create a `.env.local` file at the root of the project and add the following keys based on your Firebase Config and Gemini API Key:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Running Locally
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.
