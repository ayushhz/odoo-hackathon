// Password visibility toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    } else {
        input.type = 'password';
        toggle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) strength += 1;
    else feedback.push('At least 8 characters');

    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 1;
    else feedback.push('One uppercase letter');

    // Lowercase check
    if (/[a-z]/.test(password)) strength += 1;
    else feedback.push('One lowercase letter');

    // Number check
    if (/\d/.test(password)) strength += 1;
    else feedback.push('One number');

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    else feedback.push('One special character');

    return { strength, feedback };
}

// Update password strength indicator
function updatePasswordStrength() {
    const passwordInput = document.getElementById('signupPassword');
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.getElementById('strengthLevel');
    const strengthContainer = document.querySelector('.password-strength');

    if (!passwordInput || !strengthBar || !strengthText) return;

    const password = passwordInput.value;
    const { strength } = checkPasswordStrength(password);

    // Remove existing strength classes
    strengthContainer.classList.remove('strength-weak', 'strength-fair', 'strength-good', 'strength-strong');

    if (password.length === 0) {
        strengthBar.style.width = '0%';
        strengthText.textContent = 'Enter a password';
        return;
    }

    let level = '';
    let className = '';

    if (strength <= 2) {
        level = 'Weak';
        className = 'strength-weak';
    } else if (strength === 3) {
        level = 'Fair';
        className = 'strength-fair';
    } else if (strength === 4) {
        level = 'Good';
        className = 'strength-good';
    } else {
        level = 'Strong';
        className = 'strength-strong';
    }

    strengthContainer.classList.add(className);
    strengthText.textContent = level;
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--error-color)';
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    });

    // Email validation
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input.value && !emailRegex.test(input.value)) {
            isValid = false;
            input.style.borderColor = 'var(--error-color)';
        }
    });

    // Password confirmation validation (signup form)
    if (formId === 'signupForm') {
        const password = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            isValid = false;
            confirmPassword.style.borderColor = 'var(--error-color)';
        }

        // Terms checkbox validation
        const termsCheckbox = document.getElementById('terms');
        if (termsCheckbox && !termsCheckbox.checked) {
            isValid = false;
        }
    }

    return isValid;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background-color: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize auth page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Password strength checker for signup
    const signupPassword = document.getElementById('signupPassword');
    if (signupPassword) {
        signupPassword.addEventListener('input', updatePasswordStrength);
    }

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm('loginForm')) {
                showNotification('Signing you in...', 'info');
                
                // Simulate login process
                setTimeout(() => {
                    showNotification('Welcome back to StackIt!', 'success');
                    // Redirect to dashboard or home page
                    // window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showNotification('Please fill in all required fields correctly.', 'error');
            }
        });
    }

    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm('signupForm')) {
                showNotification('Creating your account...', 'info');
                
                // Simulate signup process
                setTimeout(() => {
                    showNotification('Account created successfully! Welcome to StackIt!', 'success');
                    // Redirect to dashboard or home page
                    // window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showNotification('Please fill in all required fields correctly.', 'error');
            }
        });
    }

    // Social login buttons
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.classList.contains('btn-google') ? 'Google' : 'GitHub';
            showNotification(`Redirecting to ${provider}...`, 'info');
            
            // Simulate social login redirect
            setTimeout(() => {
                showNotification(`${provider} authentication would open here.`, 'info');
            }, 1000);
        });
    });

    // Real-time password confirmation validation
    const confirmPassword = document.getElementById('confirmPassword');
    const signupPasswordInput = document.getElementById('signupPassword');
    
    if (confirmPassword && signupPasswordInput) {
        confirmPassword.addEventListener('input', function() {
            if (this.value && signupPasswordInput.value !== this.value) {
                this.style.borderColor = 'var(--error-color)';
            } else {
                this.style.borderColor = 'var(--border-color)';
            }
        });
    }

    // Clear validation errors on input
    const allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'var(--error-color)') {
                this.style.borderColor = 'var(--border-color)';
            }
        });
    });
});