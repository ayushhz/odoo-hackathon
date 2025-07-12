// Questions and Answers Management
import { questionService, answerService, authService, utils } from './firebase-config.js';

// Question management functions
export const questionManager = {
    // Initialize questions page
    async init() {
        await this.loadQuestions();
        this.bindEventListeners();
    },

    // Load and display questions
    async loadQuestions() {
        try {
            const result = await questionService.getQuestions();
            if (result.success) {
                this.displayQuestions(result.questions);
            } else {
                console.error('Failed to load questions:', result.error);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    },

    // Display questions in the UI
    displayQuestions(questions) {
        const questionsContainer = document.getElementById('questionsContainer');
        if (!questionsContainer) return;

        questionsContainer.innerHTML = '';

        if (questions.length === 0) {
            questionsContainer.innerHTML = `
                <div class="no-questions">
                    <h3>No questions yet</h3>
                    <p>Be the first to ask a question!</p>
                    <button class="btn btn-primary" onclick="window.location.href='ask-question.html'">
                        Ask First Question
                    </button>
                </div>
            `;
            return;
        }

        questions.forEach(question => {
            const questionElement = this.createQuestionElement(question);
            questionsContainer.appendChild(questionElement);
        });
    },

    // Create question element
    createQuestionElement(question) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <div class="question-stats">
                <div class="stat">
                    <span class="stat-number">${question.votes || 0}</span>
                    <span class="stat-label">votes</span>
                </div>
                <div class="stat ${question.isAnswered ? 'answered' : ''}">
                    <span class="stat-number">${question.answers || 0}</span>
                    <span class="stat-label">answers</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${question.views || 0}</span>
                    <span class="stat-label">views</span>
                </div>
            </div>
            <div class="question-content">
                <h3 class="question-title">
                    <a href="question.html?id=${question.id}">${question.title}</a>
                </h3>
                <div class="question-excerpt">
                    ${question.content.substring(0, 200)}${question.content.length > 200 ? '...' : ''}
                </div>
                <div class="question-meta">
                    <div class="question-tags">
                        ${question.tags ? question.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                    <div class="question-author">
                        <span>asked ${utils.formatTimestamp(question.createdAt)} by</span>
                        <span class="author-name">${question.authorName}</span>
                    </div>
                </div>
            </div>
        `;
        return questionDiv;
    },

    // Bind event listeners
    bindEventListeners() {
        // Ask question button
        const askQuestionBtn = document.getElementById('askQuestionBtn');
        if (askQuestionBtn) {
            askQuestionBtn.addEventListener('click', () => {
                const user = authService.getCurrentUser();
                if (user) {
                    window.location.href = 'ask-question.html';
                } else {
                    window.location.href = 'login.html';
                }
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuestions(e.target.value);
            });
        }
    },

    // Search questions
    searchQuestions(query) {
        // Implementation for searching questions
        // This would filter the displayed questions based on the query
        console.log('Searching for:', query);
    }
};

// Answer management functions
export const answerManager = {
    questionId: null,

    // Initialize answer page
    async init(questionId) {
        this.questionId = questionId;
        await this.loadQuestion();
        await this.loadAnswers();
        this.bindEventListeners();
    },

    // Load and display question
    async loadQuestion() {
        try {
            const result = await questionService.getQuestionById(this.questionId);
            if (result.success) {
                this.displayQuestion(result.question);
            } else {
                console.error('Failed to load question:', result.error);
            }
        } catch (error) {
            console.error('Error loading question:', error);
        }
    },

    // Load and display answers
    async loadAnswers() {
        try {
            const result = await answerService.getAnswersByQuestionId(this.questionId);
            if (result.success) {
                this.displayAnswers(result.answers);
            } else {
                console.error('Failed to load answers:', result.error);
            }
        } catch (error) {
            console.error('Error loading answers:', error);
        }
    },

    // Display question
    displayQuestion(question) {
        const questionContainer = document.getElementById('questionContainer');
        if (!questionContainer) return;

        questionContainer.innerHTML = `
            <div class="question-header">
                <h1>${question.title}</h1>
                <div class="question-meta">
                    <span>Asked ${utils.formatTimestamp(question.createdAt)} by ${question.authorName}</span>
                    <span>Viewed ${question.views || 0} times</span>
                </div>
            </div>
            <div class="question-body">
                <div class="question-voting">
                    <button class="vote-btn vote-up" data-question-id="${question.id}" data-vote-type="up">
                        ▲
                    </button>
                    <span class="vote-count">${question.votes || 0}</span>
                    <button class="vote-btn vote-down" data-question-id="${question.id}" data-vote-type="down">
                        ▼
                    </button>
                </div>
                <div class="question-content">
                    <div class="question-text">${question.content}</div>
                    <div class="question-tags">
                        ${question.tags ? question.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            </div>
        `;
    },

    // Display answers
    displayAnswers(answers) {
        const answersContainer = document.getElementById('answersContainer');
        if (!answersContainer) return;

        answersContainer.innerHTML = `
            <h3>${answers.length} Answer${answers.length !== 1 ? 's' : ''}</h3>
        `;

        answers.forEach(answer => {
            const answerElement = this.createAnswerElement(answer);
            answersContainer.appendChild(answerElement);
        });
    },

    // Create answer element
    createAnswerElement(answer) {
        const answerDiv = document.createElement('div');
        answerDiv.className = `answer-item ${answer.isAccepted ? 'accepted' : ''}`;
        answerDiv.innerHTML = `
            <div class="answer-voting">
                <button class="vote-btn vote-up" data-answer-id="${answer.id}" data-vote-type="up">
                    ▲
                </button>
                <span class="vote-count">${answer.votes || 0}</span>
                <button class="vote-btn vote-down" data-answer-id="${answer.id}" data-vote-type="down">
                    ▼
                </button>
                ${answer.isAccepted ? '<div class="accepted-mark">✓</div>' : ''}
            </div>
            <div class="answer-content">
                <div class="answer-text">${answer.content}</div>
                <div class="answer-meta">
                    <span>Answered ${utils.formatTimestamp(answer.createdAt)} by ${answer.authorName}</span>
                </div>
            </div>
        `;
        return answerDiv;
    },

    // Bind event listeners
    bindEventListeners() {
        // Answer form submission
        const answerForm = document.getElementById('answerForm');
        if (answerForm) {
            answerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitAnswer();
            });
        }

        // Vote buttons
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('vote-btn')) {
                await this.handleVote(e.target);
            }
        });
    },

    // Submit new answer
    async submitAnswer() {
        const user = authService.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const answerContent = document.getElementById('answerContent').value;
        if (!answerContent.trim()) {
            alert('Please enter your answer');
            return;
        }

        try {
            const userProfile = await userService.getUserProfile(user.uid);
            const result = await answerService.createAnswer({
                content: answerContent,
                questionId: this.questionId,
                authorId: user.uid,
                authorName: userProfile.success ? userProfile.user.displayName : user.email
            });

            if (result.success) {
                document.getElementById('answerContent').value = '';
                await this.loadAnswers(); // Reload answers
                alert('Answer submitted successfully!');
            } else {
                alert('Failed to submit answer: ' + result.error);
            }
        } catch (error) {
            alert('Error submitting answer');
            console.error(error);
        }
    },

    // Handle voting
    async handleVote(button) {
        const user = authService.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const questionId = button.dataset.questionId;
        const answerId = button.dataset.answerId;
        const voteType = button.dataset.voteType;

        // Implementation for voting logic
        console.log('Vote:', { questionId, answerId, voteType });
    }
};

// User authentication state management
export const authStateManager = {
    currentUser: null,

    // Initialize auth state
    init() {
        this.checkAuthState();
        authService.onAuthStateChange((user) => {
            this.currentUser = user;
            this.updateUI(user);
        });
    },

    // Check current auth state
    checkAuthState() {
        const user = authService.getCurrentUser();
        this.updateUI(user);
    },

    // Update UI based on auth state
    updateUI(user) {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const userMenu = document.getElementById('userMenu');
        const askQuestionBtn = document.getElementById('askQuestionBtn');

        if (user) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'block';
                userMenu.innerHTML = `
                    <span>Welcome, ${user.email}</span>
                    <button class="btn btn-outline" onclick="authStateManager.logout()">Logout</button>
                `;
            }
            if (askQuestionBtn) askQuestionBtn.style.display = 'block';
        } else {
            // User is not logged in
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
            if (askQuestionBtn) askQuestionBtn.style.display = 'none';
        }
    },

    // Logout user
    async logout() {
        try {
            await authService.logoutUser();
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
};

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    authStateManager.init();

    // Initialize based on page
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    if (path.includes('index.html') || path === '/') {
        questionManager.init();
    } else if (path.includes('question.html')) {
        const questionId = urlParams.get('id');
        if (questionId) {
            answerManager.init(questionId);
        }
    }
});
