/**
 * Anime Rewards JavaScript
 */

const API_BASE = 'http://localhost:3000/api';

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
            document.getElementById('unlocked').textContent = data.unlocked.toFixed(1);
            document.getElementById('watched').textContent = data.watched.toFixed(1);
            document.getElementById('remaining').textContent = data.remaining.toFixed(1);
        }
    } catch (error) {
        console.error('Failed to load anime balance:', error);
    }
}

async function watchEpisodes() {
    const episodes = parseFloat(document.getElementById('episodes-to-watch').value);

    if (episodes <= 0) {
        showMessage('❌ Please enter a valid number', 'error');
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
            showMessage(`✅ Enjoyed ${episodes} episode(s)! 🎉`, 'success');
            await loadAnimeBalance();
        } else {
            showMessage(`❌ ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Watch error:', error);
        showMessage('❌ Network error', 'error');
    }
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    const className = type === 'success' ? 'badge-success' :
        type === 'error' ? 'badge-error' : 'badge-info';

    container.innerHTML = `<div class="badge ${className}">${message}</div>`;

    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAnimeBalance();
    document.getElementById('watch-btn').addEventListener('click', watchEpisodes);
});
