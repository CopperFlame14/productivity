/**
 * ProQuest App Shell V2
 * Sidebar with Lucide icons, topbar, shared utilities
 */

const APP_CONFIG = {
    appName: 'ProQuest',
    navItems: [
        { href: '/dashboard.html', icon: 'layout-dashboard', label: 'Dashboard' },
        { href: '/anime.html', icon: 'tv', label: 'Anime Rewards' },
        { href: '/leaderboard.html', icon: 'trophy', label: 'Leaderboard' },
        { href: '/analytics.html', icon: 'bar-chart-3', label: 'Analytics' },
        { href: '/goals.html', icon: 'target', label: 'Goals' },
        { href: '/achievements.html', icon: 'award', label: 'Achievements' },
        { href: '/profile.html', icon: 'user', label: 'Profile' },
    ]
};

function initAppShell() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const path = window.location.pathname;
    const page = APP_CONFIG.navItems.find(i => path.endsWith(i.href.replace('/', ''))) || APP_CONFIG.navItems[0];
    const body = document.body;
    const existing = body.innerHTML;

    body.innerHTML = `
    <div class="app-layout">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-brand">
                <div class="sidebar-brand-icon"><i data-lucide="zap"></i></div>
                <span class="sidebar-brand-text">${APP_CONFIG.appName}</span>
            </div>
            <nav class="sidebar-nav">
                <div class="sidebar-section">
                    <div class="sidebar-section-title">Menu</div>
                    ${APP_CONFIG.navItems.slice(0, 4).map(i => `
                        <a href="${i.href}" class="sidebar-link ${path.endsWith(i.href.replace('/','')) ? 'active' : ''}">
                            <span class="sidebar-link-icon"><i data-lucide="${i.icon}"></i></span>
                            <span>${i.label}</span>
                        </a>`).join('')}
                </div>
                <div class="sidebar-section">
                    <div class="sidebar-section-title">Personal</div>
                    ${APP_CONFIG.navItems.slice(4).map(i => `
                        <a href="${i.href}" class="sidebar-link ${path.endsWith(i.href.replace('/','')) ? 'active' : ''}">
                            <span class="sidebar-link-icon"><i data-lucide="${i.icon}"></i></span>
                            <span>${i.label}</span>
                        </a>`).join('')}
                </div>
            </nav>
            <div class="sidebar-footer">
                <div class="sidebar-user" onclick="window.location.href='/profile.html'">
                    <div class="sidebar-avatar">${getInitials(user.name||'U')}</div>
                    <div class="sidebar-user-info">
                        <div class="sidebar-user-name">${user.name||'User'}</div>
                        <div class="sidebar-user-role">Level ${user.level||1}</div>
                    </div>
                </div>
            </div>
        </aside>
        <div class="main-area">
            <header class="topbar">
                <div class="topbar-left">
                    <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu"><i data-lucide="menu" style="width:20px;height:20px"></i></button>
                    <span class="topbar-title">${page ? page.label : 'Dashboard'}</span>
                </div>
                <div class="topbar-right">
                    <div class="level-badge" id="topbar-level">
                        <i data-lucide="star" style="width:14px;height:14px"></i>
                        <span id="topbar-level-text">Lvl ${user.level||1}</span>
                    </div>
                    <button class="btn btn-ghost btn-sm" onclick="logout()">
                        <i data-lucide="log-out" style="width:16px;height:16px"></i> Logout
                    </button>
                </div>
            </header>
            <main class="content" id="page-content">${existing}</main>
        </div>
    </div>
    <div class="toast-container" id="toast-container"></div>`;

    initMobileMenu();
    // Initialize Lucide icons
    if (window.lucide) lucide.createIcons();
}

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (btn) btn.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('active'); });
    if (overlay) overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });
}

function getInitials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

function showToast(message, type = 'info', duration = 3500) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.innerHTML = message;
    c.appendChild(t);
    setTimeout(() => { t.style.animation = 'fadeIn 0.25s ease reverse both'; setTimeout(() => t.remove(), 250); }, duration);
}

function animateNumber(el, target, duration = 900) {
    const start = parseInt(el.textContent) || 0;
    const t0 = performance.now();
    (function update(now) {
        const p = Math.min((now - t0) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(start + (target - start) * e);
        if (p < 1) requestAnimationFrame(update);
    })(t0);
}

function updateXPBar(xp, max = 500) {
    const pct = ((xp % max) / max) * 100;
    const fill = document.getElementById('xp-bar-fill');
    const val = document.getElementById('xp-bar-value');
    if (fill) fill.style.width = `${pct}%`;
    if (val) val.textContent = `${xp % max} / ${max} XP`;
}

function updateHealthMeter(hp) {
    const fill = document.getElementById('health-bar-fill');
    if (!fill) return;
    fill.style.width = `${hp}%`;
    fill.className = 'health-bar-fill ' + (hp > 60 ? 'hp-high' : hp > 30 ? 'hp-medium' : 'hp-low');
}

function formatNumber(n) {
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
    return n.toString();
}

document.addEventListener('DOMContentLoaded', () => {
    const p = window.location.pathname;
    if (!['/', '/index.html', '/signup.html'].includes(p)) initAppShell();
    else if (window.lucide) lucide.createIcons();
});
