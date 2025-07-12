// Firestore Security Rules for StackIt Q&A Platform
// Updated rules to fix voting and answer visibility issues
// Copy and paste these rules into Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other user profiles for display
    }
    
    // Questions collection - authenticated users can create, everyone can read
    match /questions/{questionId} {
      allow read: if true; // Anyone can read questions (public Q&A)
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.authorId
        && request.resource.data.keys().hasAll(['title', 'content', 'authorId', 'authorName', 'createdAt']);
      allow update: if request.auth != null; // Allow updates for voting and answer count increments
      allow delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // Answers collection - authenticated users can create, everyone can read
    match /answers/{answerId} {
      allow read: if true; // Anyone can read answers
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.authorId
        && request.resource.data.keys().hasAll(['content', 'questionId', 'authorId', 'authorName', 'createdAt']);
      allow update: if request.auth != null; // Allow updates for voting and acceptance
      allow delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // Question votes collection - for voting system
    match /votes/{voteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Answer votes collection - for voting system
    match /answer_votes/{voteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Tags collection - read-only for autocomplete
    match /tags/{tagId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Test collection for diagnostics
    match /test/{document=**} {
      allow read, write: if true;
    }
  }
}
