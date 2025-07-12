# Firebase Security Rules Setup

## 🔥 Quick Fix for "No Permission" Error

### **Step 1: Go to Firebase Console**
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **stackit-3287a**
3. Go to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### **Step 2: Update Security Rules**
Replace your current rules with these **development-friendly** rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow read access to questions and answers for everyone (including anonymous)
    match /questions/{questionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /answers/{answerId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User profiles - only the user can access their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### **Step 3: Publish Rules**
1. Click **Publish** button
2. Wait for the rules to deploy (usually takes a few seconds)

### **Step 4: Test Again**
1. Refresh your question page
2. The answers should now load properly

---

## 🛡️ Production Rules (Use Later)

For production, use these more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Questions: Anyone can read, only authenticated users can write
    match /questions/{questionId} {
      allow read: if true;
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
      allow update: if request.auth != null 
        && (request.auth.uid == resource.data.authorId 
            || onlyUpdatingVotes());
      allow delete: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
    
    // Answers: Anyone can read, only authenticated users can write
    match /answers/{answerId} {
      allow read: if true;
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
      allow update: if request.auth != null 
        && (request.auth.uid == resource.data.authorId 
            || onlyUpdatingVotes());
      allow delete: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
    
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Helper function to check if only votes are being updated
    function onlyUpdatingVotes() {
      return request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['votes', 'updatedAt']);
    }
  }
}
```

---

## 🔍 If Issues Persist

### **Check Indexes**
1. Go to **Firestore Database** → **Indexes** tab
2. Look for any failed index creation
3. Create composite indexes if needed:
   - Collection: `answers`
   - Fields: `questionId` (Ascending), `createdAt` (Ascending)

### **Check Authentication**
1. Go to **Authentication** → **Users** tab
2. Make sure your test user exists
3. Try logging out and logging back in

### **Debug in Browser Console**
1. Open Developer Tools (F12)
2. Check Console tab for specific error messages
3. Look for Firebase authentication status

---

## 📞 Quick Test Commands

Run these in your browser console to test:

```javascript
// Check if user is authenticated
firebase.auth().currentUser

// Test reading answers collection
firebase.firestore().collection('answers').get()
  .then(snapshot => console.log('Answers count:', snapshot.size))
  .catch(error => console.error('Error:', error))
```
