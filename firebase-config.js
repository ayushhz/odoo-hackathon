// Firebase Configuration (CDN Version)
// Your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJB6PerPX5vz4QWI-PLD1ulr-ISgrAzBA",
    authDomain: "stackit-3287a.firebaseapp.com",
    projectId: "stackit-3287a",
    storageBucket: "stackit-3287a.firebasestorage.app",
    messagingSenderId: "224314361735",
    appId: "1:224314361735:web:cb00f00ac4dfac165db522",
    measurementId: "G-CZ6ZJSPP3W"
};

// Import Firebase from CDN (this will be loaded via script tags)
// Note: This file should be loaded after Firebase scripts in HTML

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Authentication functions
const authService = {
    // Register new user
    async registerUser(email, password, userData) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Store additional user data in Firestore
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: email,
                username: userData.username,
                displayName: userData.displayName || userData.username,
                bio: userData.bio || '',
                reputation: 0,
                joinDate: firebase.firestore.FieldValue.serverTimestamp(),
                avatar: userData.avatar || null,
                role: 'user' // user, admin
            });
            
            return { success: true, user: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Login user
    async loginUser(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Logout user
    async logoutUser() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get current user
    getCurrentUser() {
        return auth.currentUser;
    },

    // Monitor auth state changes
    onAuthStateChange(callback) {
        return auth.onAuthStateChanged(callback);
    }
};

// Database functions for questions
const questionService = {
    // Create a new question
    async createQuestion(questionData) {
        try {
            const docRef = await db.collection('questions').add({
                title: questionData.title,
                content: questionData.content,
                tags: questionData.tags || [],
                authorId: questionData.authorId,
                authorName: questionData.authorName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                votes: 0,
                views: 0,
                answers: 0,
                isAnswered: false,
                acceptedAnswerId: null
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get all questions
    async getQuestions(limit = 20) {
        try {
            const querySnapshot = await db.collection('questions')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            
            const questions = [];
            querySnapshot.forEach((doc) => {
                questions.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, questions };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get question by ID
    async getQuestionById(questionId) {
        try {
            const doc = await db.collection('questions').doc(questionId).get();
            if (doc.exists) {
                return { success: true, question: { id: doc.id, ...doc.data() } };
            } else {
                return { success: false, error: "Question not found" };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update question
    async updateQuestion(questionId, updateData) {
        try {
            await db.collection('questions').doc(questionId).update({
                ...updateData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Delete question
    async deleteQuestion(questionId) {
        try {
            await db.collection('questions').doc(questionId).delete();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Database functions for answers
const answerService = {
    // Create a new answer
    async createAnswer(answerData) {
        try {
            const docRef = await db.collection('answers').add({
                content: answerData.content,
                questionId: answerData.questionId,
                authorId: answerData.authorId,
                authorName: answerData.authorName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                votes: 0,
                isAccepted: false
            });

            // Update question answer count
            await db.collection('questions').doc(answerData.questionId).update({
                answers: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get answers for a question
    async getAnswersByQuestionId(questionId) {
        try {
            const querySnapshot = await db.collection('answers')
                .where('questionId', '==', questionId)
                .orderBy('votes', 'desc')
                .orderBy('createdAt', 'asc')
                .get();
            
            const answers = [];
            querySnapshot.forEach((doc) => {
                answers.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, answers };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Accept an answer
    async acceptAnswer(answerId, questionId) {
        try {
            // Update answer to accepted
            await db.collection('answers').doc(answerId).update({
                isAccepted: true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update question
            await db.collection('questions').doc(questionId).update({
                isAnswered: true,
                acceptedAnswerId: answerId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Database functions for users
const userService = {
    // Get user profile
    async getUserProfile(userId) {
        try {
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                return { success: true, user: doc.data() };
            } else {
                return { success: false, error: "User not found" };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update user profile
    async updateUserProfile(userId, updateData) {
        try {
            await db.collection('users').doc(userId).update(updateData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Storage functions for file uploads
const storageService = {
    // Upload file (images, etc.)
    async uploadFile(file, path) {
        try {
            const storageRef = storage.ref(path);
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return { success: true, url: downloadURL };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Utility functions
const utils = {
    // Format timestamp
    formatTimestamp(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },

    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Generate unique username
    generateUsername(email) {
        return email.split('@')[0] + '_' + Math.random().toString(36).substring(7);
    }
};

// Make services available globally
window.authService = authService;
window.questionService = questionService;
window.answerService = answerService;
window.userService = userService;
window.storageService = storageService;
window.utils = utils;
