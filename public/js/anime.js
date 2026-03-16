/**
 * Anime Rewards JavaScript
 * Enhanced with toast notifications and animations
 */

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

async function loadAnimeBalance() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/anime/balance`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();

            const unlockedEl = document.getElementById('unlocked');
            const watchedEl = document.getElementById('watched');
            const remainingEl = document.getElementById('remaining');

            if (typeof animateNumber === 'function') {
                animateNumber(unlockedEl, Math.round(data.unlocked * 10) / 10);
                animateNumber(watchedEl, Math.round(data.watched * 10) / 10);
                animateNumber(remainingEl, Math.round(data.remaining * 10) / 10);
            } else {
                unlockedEl.textContent = data.unlocked.toFixed(1);
                watchedEl.textContent = data.watched.toFixed(1);
                remainingEl.textContent = data.remaining.toFixed(1);
            }
        }
    } catch (error) {
        console.error('Failed to load anime balance:', error);
    }
}

async function watchEpisodes() {
    const episodes = parseFloat(document.getElementById('episodes-to-watch').value);

    if (episodes <= 0) {
        if (typeof showToast === 'function') {
            showToast('❌ Please enter a valid number', 'error');
        }
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/anime/watch`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ episodes })
        });

        const data = await response.json();

        if (response.ok) {
            if (typeof showToast === 'function') {
                showToast(`🎬 Enjoyed ${episodes} episode(s)! 🎉`, 'success');
            }
            await loadAnimeBalance();
        } else {
            if (typeof showToast === 'function') {
                showToast(`❌ ${data.error}`, 'error');
            }
        }
    } catch (error) {
        console.error('Watch error:', error);
        if (typeof showToast === 'function') {
            showToast('❌ Network error', 'error');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAnimeBalance();
    document.getElementById('watch-btn').addEventListener('click', watchEpisodes);
});
