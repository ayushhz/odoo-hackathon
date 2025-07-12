// Modern Firebase Configuration using ES6 modules
// Firebase v9+ SDK with tree-shaking support

// Import Firebase functions from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc,
    doc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    where, 
    limit,
    serverTimestamp,
    increment 
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJB6PerPX5vz4QWI-PLD1ulr-ISgrAzBA",
    authDomain: "stackit-3287a.firebaseapp.com",
    projectId: "stackit-3287a",
    storageBucket: "stackit-3287a.firebasestorage.app",
    messagingSenderId: "224314361735",
    appId: "1:224314361735:web:cb00f00ac4dfac165db522",
    measurementId: "G-CZ6ZJSPP3W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Authentication service
export const authService = {
    // Register new user
    async registerUser(email, password, userData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Store additional user data in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: email,
                username: userData.username,
                displayName: userData.displayName || userData.username,
                bio: userData.bio || '',
                reputation: 0,
                joinDate: serverTimestamp(),
                avatar: userData.avatar || null,
                role: 'user'
            });
            
            return { success: true, user: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Login user
    async loginUser(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Logout user
    async logoutUser() {
        try {
            await signOut(auth);
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
        return onAuthStateChanged(auth, callback);
    }
};

// Question service
export const questionService = {
    // Create a new question
    async createQuestion(questionData) {
        try {
            const docRef = await addDoc(collection(db, 'questions'), {
                title: questionData.title,
                content: questionData.content,
                tags: questionData.tags || [],
                authorId: questionData.authorId,
                authorName: questionData.authorName,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
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
    async getQuestions(limitCount = 20) {
        try {
            const q = query(
                collection(db, 'questions'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
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
            const docRef = doc(db, 'questions', questionId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { success: true, question: { id: docSnap.id, ...docSnap.data() } };
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
            const docRef = doc(db, 'questions', questionId);
            await updateDoc(docRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Delete question
    async deleteQuestion(questionId) {
        try {
            await deleteDoc(doc(db, 'questions', questionId));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Answer service
export const answerService = {
    // Create a new answer
    async createAnswer(answerData) {
        try {
            const docRef = await addDoc(collection(db, 'answers'), {
                content: answerData.content,
                questionId: answerData.questionId,
                authorId: answerData.authorId,
                authorName: answerData.authorName,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                votes: 0,
                isAccepted: false
            });

            // Update question answer count
            await updateDoc(doc(db, 'questions', answerData.questionId), {
                answers: increment(1),
                updatedAt: serverTimestamp()
            });

            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get answers for a question
    async getAnswersByQuestionId(questionId) {
        try {
            const q = query(
                collection(db, 'answers'),
                where('questionId', '==', questionId),
                orderBy('votes', 'desc'),
                orderBy('createdAt', 'asc')
            );
            const querySnapshot = await getDocs(q);
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
            await updateDoc(doc(db, 'answers', answerId), {
                isAccepted: true,
                updatedAt: serverTimestamp()
            });

            // Update question
            await updateDoc(doc(db, 'questions', questionId), {
                isAnswered: true,
                acceptedAnswerId: answerId,
                updatedAt: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// User service
export const userService = {
    // Get user profile
    async getUserProfile(userId) {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { success: true, user: docSnap.data() };
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
            const docRef = doc(db, 'users', userId);
            await updateDoc(docRef, updateData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Storage service
export const storageService = {
    // Upload file
    async uploadFile(file, path) {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return { success: true, url: downloadURL };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Utility functions
export const utils = {
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

// Export Firebase instances for direct access if needed
export { app, auth, db, storage, analytics };
