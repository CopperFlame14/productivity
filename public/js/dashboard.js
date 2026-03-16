/**
 * Dashboard JavaScript
 * Handles daily task tracking and stats display
 * Enhanced with gamification animations and XP/HP visuals
 */

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';
let leetcodePanel;

// Initialize dashboard
async function initDashboard() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Initialize LeetCode panel
    leetcodePanel = new LeetCodePanel('leetcode-container');

    // Load today's data
    await loadTodayData();

    // Attach event listeners
    attachEventListeners();
}

// Load today's daily record
async function loadTodayData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/daily`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const record = await response.json();
            populateForm(record);
        }

        // Also load user stats
        await loadUserStats();
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// Populate form with existing data
function populateForm(record) {
    if (record.tasks) {
        // Workout
        document.getElementById('task-workout').checked = record.tasks.workout?.completed || false;
        document.getElementById('workout-min').value = record.tasks.workout?.minutes || '';
        document.getElementById('workout-bonus').value = record.tasks.workout?.bonusMinutes || '';

        // Project
        document.getElementById('task-project').checked = record.tasks.project?.completed || false;
        document.getElementById('project-min').value = record.tasks.project?.minutes || '';
        document.getElementById('project-bonus').value = record.tasks.project?.bonusMinutes || '';

        // Study
        document.getElementById('task-study').checked = record.tasks.study?.completed || false;
        document.getElementById('study-min').value = record.tasks.study?.minutes || '';
        document.getElementById('study-bonus').value = record.tasks.study?.bonusMinutes || '';

        // Water
        document.getElementById('task-water').checked = record.tasks.water?.completed || false;
        document.getElementById('water-glasses').value = record.tasks.water?.glasses || '';
    }

    if (record.scores) {
        const scoreEl = document.getElementById('score');
        const rankEl = document.getElementById('rank');
        const scoreVal = Math.round(record.scores.finalScore);

        if (typeof animateNumber === 'function') {
            animateNumber(scoreEl, scoreVal);
        } else {
            scoreEl.textContent = scoreVal;
        }

        rankEl.textContent = record.scores.rank;
        rankEl.className = `rank-badge rank-${record.scores.rank.toLowerCase()}`;
    }

    if (record.xp) {
        const levelEl = document.getElementById('level');
        const xpEl = document.getElementById('xp');

        if (typeof animateNumber === 'function') {
            animateNumber(levelEl, record.xp.level);
            animateNumber(xpEl, record.xp.total);
        } else {
            levelEl.textContent = record.xp.level;
            xpEl.textContent = record.xp.total;
        }

        // Update XP bar
        if (typeof updateXPBar === 'function') {
            updateXPBar(record.xp.total);
        }
    }

    if (record.streak) {
        const streakEl = document.getElementById('streak');
        if (typeof animateNumber === 'function') {
            animateNumber(streakEl, record.streak.current);
        } else {
            streakEl.textContent = record.streak.current;
        }
    }

    if (record.hp !== undefined) {
        const hpEl = document.getElementById('hp');
        if (typeof animateNumber === 'function') {
            animateNumber(hpEl, record.hp);
        } else {
            hpEl.textContent = record.hp;
        }

        // Update health meter
        if (typeof updateHealthMeter === 'function') {
            updateHealthMeter(record.hp);
        }
    }
}

// Load user stats
async function loadUserStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            const levelEl = document.getElementById('level');
            const xpEl = document.getElementById('xp');
            const streakEl = document.getElementById('streak');

            if (typeof animateNumber === 'function') {
                animateNumber(levelEl, user.stats.level);
                animateNumber(xpEl, user.stats.totalXP);
                animateNumber(streakEl, user.stats.currentStreak);
            } else {
                levelEl.textContent = user.stats.level;
                xpEl.textContent = user.stats.totalXP;
                streakEl.textContent = user.stats.currentStreak;
            }

            // Update XP bar
            if (typeof updateXPBar === 'function') {
                updateXPBar(user.stats.totalXP);
            }

            // Update topbar level
            const topbarLevel = document.getElementById('topbar-level-text');
            if (topbarLevel) {
                topbarLevel.textContent = `Lvl ${user.stats.level}`;
            }

            // Update greeting with user name
            const pageHeader = document.querySelector('.page-header h1');
            if (pageHeader && user.name) {
                const hour = new Date().getHours();
                let greeting = 'Good evening';
                if (hour < 12) greeting = 'Good morning';
                else if (hour < 17) greeting = 'Good afternoon';
                pageHeader.textContent = `${greeting}, ${user.name.split(' ')[0]}! 👋`;
            }
        }
    } catch (error) {
        console.error('Failed to load user stats:', error);
    }
}

// Save daily data
async function saveDailyData() {
    try {
        // Get LeetCode data (auto or manual)
        const leetcodeProblems = await leetcodePanel.getProblemsCompleted();

        const tasks = {
            workout: {
                completed: document.getElementById('task-workout').checked,
                minutes: parseInt(document.getElementById('workout-min').value) || 0,
                bonusMinutes: parseInt(document.getElementById('workout-bonus').value) || 0
            },
            leetcode: {
                completed: leetcodeProblems >= 1,
                problemsSolved: leetcodeProblems,
                bonusProblems: Math.max(0, leetcodeProblems - 1)
            },
            project: {
                completed: document.getElementById('task-project').checked,
                minutes: parseInt(document.getElementById('project-min').value) || 0,
                bonusMinutes: parseInt(document.getElementById('project-bonus').value) || 0
            },
            study: {
                completed: document.getElementById('task-study').checked,
                minutes: parseInt(document.getElementById('study-min').value) || 0,
                bonusMinutes: parseInt(document.getElementById('study-bonus').value) || 0
            },
            water: {
                completed: document.getElementById('task-water').checked,
                glasses: parseInt(document.getElementById('water-glasses').value) || 0
            }
        };

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/daily`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tasks })
        });

        if (response.ok) {
            const data = await response.json();

            // Use toast if available, else fallback
            if (typeof showToast === 'function') {
                showToast('✅ Progress saved successfully!', 'success');
            } else {
                showMessage('✅ Progress saved successfully!', 'success');
            }

            // Update display
            populateForm(data.record);
            await loadUserStats();
        } else {
            if (typeof showToast === 'function') {
                showToast('❌ Failed to save progress', 'error');
            } else {
                showMessage('❌ Failed to save progress', 'error');
            }
        }
    } catch (error) {
        console.error('Save error:', error);
        if (typeof showToast === 'function') {
            showToast('❌ Network error', 'error');
        } else {
            showMessage('❌ Network error', 'error');
        }
    }
}

// Reset daily tasks
async function resetTasks() {
    if (!confirm('Are you sure you want to reset all tasks?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/daily/reset`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (typeof showToast === 'function') {
            showToast('🔄 Tasks reset', 'info');
        } else {
            showMessage('🔄 Tasks reset', 'info');
        }

        await loadTodayData();
    } catch (error) {
        console.error('Reset error:', error);
    }
}

// Show message (legacy fallback)
function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    if (!container) return;

    const className = type === 'success' ? 'badge-success' :
        type === 'error' ? 'badge-error' : 'badge-info';

    container.innerHTML = `<div class="badge ${className}">${message}</div>`;

    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}

// Attach event listeners
function attachEventListeners() {
    document.getElementById('save-btn').addEventListener('click', saveDailyData);
    document.getElementById('reset-btn').addEventListener('click', resetTasks);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
