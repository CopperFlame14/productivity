/**
 * Dashboard JavaScript
 * Handles daily task tracking and stats display
 */

const API_BASE = 'http://localhost:3000/api';
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
        document.getElementById('score').textContent = Math.round(record.scores.finalScore);
        document.getElementById('rank').textContent = record.scores.rank;
        document.getElementById('rank').className = `stat-value rank-${record.scores.rank.toLowerCase()}`;
    }

    if (record.xp) {
        document.getElementById('level').textContent = record.xp.level;
        document.getElementById('xp').textContent = record.xp.total;
    }

    if (record.streak) {
        document.getElementById('streak').textContent = record.streak.current;
    }

    if (record.hp !== undefined) {
        document.getElementById('hp').textContent = record.hp;
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
            document.getElementById('level').textContent = user.stats.level;
            document.getElementById('xp').textContent = user.stats.totalXP;
            document.getElementById('streak').textContent = user.stats.currentStreak;
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
            showMessage('✅ Progress saved successfully!', 'success');

            // Update display
            populateForm(data.record);
            await loadUserStats();
        } else {
            showMessage('❌ Failed to save progress', 'error');
        }
    } catch (error) {
        console.error('Save error:', error);
        showMessage('❌ Network error', 'error');
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

        showMessage('🔄 Tasks reset', 'info');
        await loadTodayData();
    } catch (error) {
        console.error('Reset error:', error);
    }
}

// Show message
function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
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
