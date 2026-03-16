/**
 * Dashboard JS V2
 * Quest completion, hero section updates, animated numbers
 */
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
let leetcodePanel;

async function initDashboard() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/'; return; }
    leetcodePanel = new LeetCodePanel('leetcode-container');
    await loadTodayData();
    attachEventListeners();
    // Re-init Lucide icons for dynamically added content
    if (window.lucide) lucide.createIcons();
}

async function loadTodayData() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/daily`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) populateForm(await res.json());
        await loadUserStats();
    } catch (e) { console.error('Failed to load data:', e); }
}

function populateForm(record) {
    if (record.tasks) {
        document.getElementById('task-workout').checked = record.tasks.workout?.completed || false;
        document.getElementById('workout-min').value = record.tasks.workout?.minutes || '';
        document.getElementById('workout-bonus').value = record.tasks.workout?.bonusMinutes || '';
        document.getElementById('task-project').checked = record.tasks.project?.completed || false;
        document.getElementById('project-min').value = record.tasks.project?.minutes || '';
        document.getElementById('project-bonus').value = record.tasks.project?.bonusMinutes || '';
        document.getElementById('task-study').checked = record.tasks.study?.completed || false;
        document.getElementById('study-min').value = record.tasks.study?.minutes || '';
        document.getElementById('study-bonus').value = record.tasks.study?.bonusMinutes || '';
        document.getElementById('task-water').checked = record.tasks.water?.completed || false;
        document.getElementById('water-glasses').value = record.tasks.water?.glasses || '';

        // Toggle quest-card completed class
        ['workout', 'project', 'study', 'water'].forEach(t => {
            const card = document.getElementById(`quest-${t}`);
            if (card) card.classList.toggle('completed', record.tasks[t]?.completed || false);
        });
    }
    if (record.scores) {
        const scoreEl = document.getElementById('score');
        const rankEl = document.getElementById('rank');
        if (typeof animateNumber === 'function') animateNumber(scoreEl, Math.round(record.scores.finalScore));
        else scoreEl.textContent = Math.round(record.scores.finalScore);
        rankEl.textContent = record.scores.rank;
        rankEl.className = `rank-badge rank-${record.scores.rank.toLowerCase()}`;
        document.getElementById('hero-rank').textContent = record.scores.rank;
    }
    if (record.xp) {
        const lvEl = document.getElementById('level'), xpEl = document.getElementById('xp');
        if (typeof animateNumber === 'function') { animateNumber(lvEl, record.xp.level); animateNumber(xpEl, record.xp.total); }
        else { lvEl.textContent = record.xp.level; xpEl.textContent = record.xp.total; }
        if (typeof updateXPBar === 'function') updateXPBar(record.xp.total);
        document.getElementById('hero-level').textContent = record.xp.level;
    }
    if (record.streak) {
        const sEl = document.getElementById('streak');
        if (typeof animateNumber === 'function') animateNumber(sEl, record.streak.current);
        else sEl.textContent = record.streak.current;
        document.getElementById('hero-streak').textContent = `${record.streak.current} days`;
    }
    if (record.hp !== undefined) {
        const hpEl = document.getElementById('hp');
        if (typeof animateNumber === 'function') animateNumber(hpEl, record.hp);
        else hpEl.textContent = record.hp;
        if (typeof updateHealthMeter === 'function') updateHealthMeter(record.hp);
    }
}

async function loadUserStats() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/user`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) return;
        const user = await res.json();
        const s = user.stats;

        if (typeof animateNumber === 'function') {
            animateNumber(document.getElementById('level'), s.level);
            animateNumber(document.getElementById('xp'), s.totalXP);
            animateNumber(document.getElementById('streak'), s.currentStreak);
        }
        if (typeof updateXPBar === 'function') updateXPBar(s.totalXP);

        // Update hero
        document.getElementById('hero-level').textContent = s.level;
        document.getElementById('hero-streak').textContent = `${s.currentStreak} days`;
        const topLvl = document.getElementById('topbar-level-text');
        if (topLvl) topLvl.textContent = `Lvl ${s.level}`;

        // Personalized greeting
        const heroName = document.getElementById('hero-name');
        if (heroName && user.name) {
            const h = new Date().getHours();
            const heroGreet = document.querySelector('.hero-greeting');
            const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
            if (heroGreet) heroGreet.innerHTML = `${greeting}, <span>${user.name.split(' ')[0]}</span> 👋`;
        }
    } catch (e) { console.error(e); }
}

async function saveDailyData() {
    try {
        const lc = await leetcodePanel.getProblemsCompleted();
        const tasks = {
            workout: { completed: document.getElementById('task-workout').checked, minutes: parseInt(document.getElementById('workout-min').value) || 0, bonusMinutes: parseInt(document.getElementById('workout-bonus').value) || 0 },
            leetcode: { completed: lc >= 1, problemsSolved: lc, bonusProblems: Math.max(0, lc - 1) },
            project: { completed: document.getElementById('task-project').checked, minutes: parseInt(document.getElementById('project-min').value) || 0, bonusMinutes: parseInt(document.getElementById('project-bonus').value) || 0 },
            study: { completed: document.getElementById('task-study').checked, minutes: parseInt(document.getElementById('study-min').value) || 0, bonusMinutes: parseInt(document.getElementById('study-bonus').value) || 0 },
            water: { completed: document.getElementById('task-water').checked, glasses: parseInt(document.getElementById('water-glasses').value) || 0 }
        };
        const res = await fetch(`${API_BASE}/daily`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ tasks }) });
        if (res.ok) { const data = await res.json(); showToast('✅ Progress saved!', 'success'); populateForm(data.record); await loadUserStats(); }
        else showToast('Failed to save', 'error');
    } catch (e) { console.error(e); showToast('Network error', 'error'); }
}

async function resetTasks() {
    if (!confirm('Reset all quests?')) return;
    try { await fetch(`${API_BASE}/daily/reset`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); showToast('Quests reset', 'info'); await loadTodayData(); } catch (e) { console.error(e); }
}

function attachEventListeners() {
    document.getElementById('save-btn').addEventListener('click', saveDailyData);
    document.getElementById('reset-btn').addEventListener('click', resetTasks);
    // Quest card checkbox -> toggle completed class
    ['workout', 'project', 'study', 'water'].forEach(t => {
        const cb = document.getElementById(`task-${t}`);
        if (cb) cb.addEventListener('change', () => {
            const card = document.getElementById(`quest-${t}`);
            if (card) card.classList.toggle('completed', cb.checked);
        });
    });
}

document.addEventListener('DOMContentLoaded', initDashboard);
