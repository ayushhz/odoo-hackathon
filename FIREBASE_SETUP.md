# Firebase Setup Guide for StackIt

## 1. Firebase Project Setup

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "stackit-forum" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Add Web App to Firebase Project
1. In your Firebase project dashboard, click the web icon (</>)
2. Enter app nickname: "StackIt Web App"
3. Choose "Set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

### Step 3: Update Firebase Configuration
1. Open `firebase-config.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
```

## 2. Firebase Services Setup

### Authentication Setup
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click and enable
   - **Google** (optional): Click, enable, and configure
   - **GitHub** (optional): Click, enable, and configure

### Firestore Database Setup
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

### Security Rules (Important!)
Update Firestore rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read questions and answers
    match /questions/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /answers/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Setup (Optional)
1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Select a location
5. Click "Done"

## 3. Install Dependencies

Run the following command in your project directory:

```bash
npm install firebase
```

## 4. Database Structure

### Users Collection
```
users/{userId}
├── uid: string
├── email: string
├── username: string
├── displayName: string
├── bio: string (optional)
├── reputation: number (default: 0)
├── joinDate: timestamp
├── avatar: string (optional)
└── role: string (default: "user")
```

### Questions Collection
```
questions/{questionId}
├── title: string
├── content: string
├── tags: array of strings
├── authorId: string
├── authorName: string
├── createdAt: timestamp
├── updatedAt: timestamp
├── votes: number (default: 0)
├── views: number (default: 0)
├── answers: number (default: 0)
├── isAnswered: boolean (default: false)
└── acceptedAnswerId: string (optional)
```

### Answers Collection
```
answers/{answerId}
├── content: string
├── questionId: string
├── authorId: string
├── authorName: string
├── createdAt: timestamp
├── updatedAt: timestamp
├── votes: number (default: 0)
└── isAccepted: boolean (default: false)
```

## 5. File Structure

Your project should now have these files:
```
├── firebase-config.js     # Firebase configuration and services
├── firebase-app.js        # Application logic for questions/answers
├── auth.js               # Updated authentication logic
├── index.html            # Main page
├── login.html            # Login page
├── signup.html           # Signup page (create this)
├── question.html         # Individual question page (create this)
├── ask-question.html     # Ask new question page (create this)
├── styles.css            # Existing styles
├── package.json          # Updated with Firebase dependency
└── README.md             # This setup guide
```

## 6. Usage Examples

### User Registration
```javascript
import { authService } from './firebase-config.js';

const result = await authService.registerUser(email, password, {
    username: 'user123',
    displayName: 'John Doe'
});
```

### Create Question
```javascript
import { questionService } from './firebase-config.js';

const result = await questionService.createQuestion({
    title: 'How to use Firebase with JavaScript?',
    content: 'I need help setting up Firebase...',
    tags: ['firebase', 'javascript'],
    authorId: user.uid,
    authorName: user.displayName
});
```

### Create Answer
```javascript
import { answerService } from './firebase-config.js';

const result = await answerService.createAnswer({
    content: 'You can use Firebase SDK...',
    questionId: 'question-id',
    authorId: user.uid,
    authorName: user.displayName
});
```

## 7. Testing

1. Start your development server:
   ```bash
   npm run serve
   ```

2. Open `http://localhost:8000`

3. Test the following features:
   - User registration
   - User login
   - View questions (initially empty)
   - Create new questions (after login)
   - Answer questions
   - Vote on questions/answers

## 8. Next Steps

1. Create additional pages:
   - `signup.html` - User registration page
   - `question.html` - Individual question view
   - `ask-question.html` - Create new question form

2. Implement additional features:
   - User profiles
   - Question search and filtering
   - Tags system
   - Reputation system
   - Email notifications

3. Deploy to Firebase Hosting:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

## 9. Security Considerations

1. **Update Firestore Security Rules** before going to production
2. **Enable App Check** for additional security
3. **Set up proper authentication rules**
4. **Validate all user inputs** on both client and server side
5. **Implement rate limiting** for API calls

## Troubleshooting

- **Import errors**: Make sure you're using a modern browser that supports ES6 modules
- **CORS errors**: Use a local server (npm run serve) instead of opening HTML files directly
- **Authentication errors**: Check your Firebase configuration and ensure Authentication is enabled
- **Firestore errors**: Verify your security rules and ensure Firestore is initialized

Your Firebase backend is now ready to store users, questions, and answers!
