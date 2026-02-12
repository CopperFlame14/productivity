/**
 * Authentication JavaScript
 * Handles login and signup functionality
 */

const API_BASE = 'http://localhost:3000/api';

// Login Form Handler
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorContainer = document.getElementById('error-container');

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect to dashboard
                window.location.href = '/dashboard.html';
            } else {
                errorContainer.innerHTML = `
          <div class="error-message">
            ${data.error || 'Login failed'}
          </div>
        `;
            }
        } catch (error) {
            errorContainer.innerHTML = `
        <div class="error-message">
          Network error. Please check your connection.
        </div>
      `;
        }
    });
}

// Signup Form Handler
if (document.getElementById('signup-form')) {
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorContainer = document.getElementById('error-container');

        try {
            const response = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect to dashboard
                window.location.href = '/dashboard.html';
            } else {
                const errorMessage = data.errors
                    ? data.errors.map(err => err.msg).join('<br>')
                    : data.error || 'Signup failed';

                errorContainer.innerHTML = `
          <div class="error-message">
            ${errorMessage}
          </div>
        `;
            }
        } catch (error) {
            errorContainer.innerHTML = `
        <div class="error-message">
          Network error. Please check your connection.
        </div>
      `;
        }
    });
}

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;

    if (token && (currentPage === '/' || currentPage === '/index.html' || currentPage === '/signup.html')) {
        window.location.href = '/dashboard.html';
    }

    if (!token && currentPage !== '/' && currentPage !== '/index.html' && currentPage !== '/signup.html') {
        window.location.href = '/';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Run auth check on page load
checkAuth();
