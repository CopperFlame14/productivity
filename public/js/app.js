/**
 * App Shell - Shared Application Layout
 * Injects sidebar, topbar, and provides shared utilities
 */

const APP_CONFIG = {
    appName: 'ProQuest',
    appIcon: '⚡',
    navItems: [
        { href: '/dashboard.html', icon: '📊', label: 'Dashboard' },
        { href: '/anime.html', icon: '🎬', label: 'Anime Rewards' },
        { href: '/leaderboard.html', icon: '🏆', label: 'Leaderboard' },
        { href: '/analytics.html', icon: '📈', label: 'Analytics' },
        { href: '/goals.html', icon: '🎯', label: 'Goals Planner' },
        { href: '/achievements.html', icon: '🏅', label: 'Achievements' },
        { href: '/profile.html', icon: '👤', label: 'Profile' },
    ]
};

/**
 * Initialize the app shell (sidebar + topbar)
 */
function initAppShell() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentPath = window.location.pathname;
    const currentPage = APP_CONFIG.navItems.find(item => currentPath.endsWith(item.href.replace('/', ''))) || APP_CONFIG.navItems[0];

    // Create app layout
    const body = document.body;
    const existingContent = body.innerHTML;

    body.innerHTML = `
        <div class="app-layout">
            <!-- Sidebar Overlay (Mobile) -->
            <div class="sidebar-overlay" id="sidebar-overlay"></div>

            <!-- Sidebar -->
            <aside class="sidebar" id="sidebar">
                <div class="sidebar-brand">
                    <div class="sidebar-brand-icon">${APP_CONFIG.appIcon}</div>
                    <span class="sidebar-brand-text">${APP_CONFIG.appName}</span>
                </div>

                <nav class="sidebar-nav">
                    <div class="sidebar-section">
                        <div class="sidebar-section-title">Menu</div>
                        ${APP_CONFIG.navItems.slice(0, 4).map(item => `
                            <a href="${item.href}" class="sidebar-link ${currentPath.endsWith(item.href.replace('/', '')) || (currentPath === '/' && item.href === '/dashboard.html') ? 'active' : ''}">
                                <span class="sidebar-link-icon">${item.icon}</span>
                                <span>${item.label}</span>
                            </a>
                        `).join('')}
                    </div>

                    <div class="sidebar-section">
                        <div class="sidebar-section-title">Personal</div>
                        ${APP_CONFIG.navItems.slice(4).map(item => `
                            <a href="${item.href}" class="sidebar-link ${currentPath.endsWith(item.href.replace('/', '')) ? 'active' : ''}">
                                <span class="sidebar-link-icon">${item.icon}</span>
                                <span>${item.label}</span>
                            </a>
                        `).join('')}
                    </div>
                </nav>

                <div class="sidebar-footer">
                    <div class="sidebar-user" onclick="window.location.href='/profile.html'">
                        <div class="sidebar-avatar">${getInitials(user.name || 'U')}</div>
                        <div class="sidebar-user-info">
                            <div class="sidebar-user-name">${user.name || 'User'}</div>
                            <div class="sidebar-user-role">Level ${user.level || 1}</div>
                        </div>
                    </div>
                </div>
            </aside>

            <!-- Main Area -->
            <div class="main-area">
                <!-- Top Bar -->
                <header class="topbar">
                    <div class="topbar-left">
                        <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu">☰</button>
                        <span class="topbar-title">${currentPage ? currentPage.label : 'Dashboard'}</span>
                    </div>
                    <div class="topbar-right">
                        <div class="level-badge" id="topbar-level">
                            <span class="level-badge-icon">⭐</span>
                            <span id="topbar-level-text">Lvl ${user.level || 1}</span>
                        </div>
                        <button class="btn btn-ghost btn-sm" onclick="logout()" title="Logout">
                            Logout
                        </button>
                    </div>
                </header>

                <!-- Page Content -->
                <main class="content" id="page-content">
                    ${existingContent}
                </main>
            </div>
        </div>

        <!-- Toast Container -->
        <div class="toast-container" id="toast-container"></div>
    `;

    // Attach mobile menu toggle
    initMobileMenu();
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

/**
 * Get user initials
 */
function getInitials(name) {
    return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Toast notification system
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.3s ease reverse both';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Animate number counting up
 */
function animateNumber(element, targetValue, duration = 800) {
    const startValue = parseInt(element.textContent) || 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * eased);

        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Create skeleton loader
 */
function createSkeleton(type = 'text', count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
        switch (type) {
            case 'text':
                html += `<div class="skeleton skeleton-text" style="width: ${70 + Math.random() * 30}%"></div>`;
                break;
            case 'stat':
                html += `<div class="skeleton skeleton-stat"></div>`;
                break;
            case 'card':
                html += `<div class="skeleton skeleton-card"></div>`;
                break;
        }
    }
    return html;
}

/**
 * Update XP bar visual
 */
function updateXPBar(currentXP, levelXP = 500) {
    const xpInLevel = currentXP % levelXP;
    const percentage = (xpInLevel / levelXP) * 100;
    const fill = document.getElementById('xp-bar-fill');
    const value = document.getElementById('xp-bar-value');

    if (fill) {
        fill.style.width = `${percentage}%`;
    }
    if (value) {
        value.textContent = `${xpInLevel} / ${levelXP} XP`;
    }
}

/**
 * Update health meter visual
 */
function updateHealthMeter(hp) {
    const fill = document.getElementById('health-bar-fill');
    if (!fill) return;

    fill.style.width = `${hp}%`;

    // Remove all HP classes
    fill.classList.remove('hp-high', 'hp-medium', 'hp-low');

    // Add appropriate class
    if (hp > 60) fill.classList.add('hp-high');
    else if (hp > 30) fill.classList.add('hp-medium');
    else fill.classList.add('hp-low');
}

/**
 * Format large numbers
 */
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Initialize app shell when DOM is ready (for dashboard pages only)
document.addEventListener('DOMContentLoaded', () => {
    // Only init app shell for authenticated pages (not login/signup)
    const currentPage = window.location.pathname;
    const authPages = ['/', '/index.html', '/signup.html'];

    if (!authPages.includes(currentPage)) {
        initAppShell();
    }
});
