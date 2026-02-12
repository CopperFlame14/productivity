/**
 * LeetCode Auto-Detection Panel
 * 
 * UI component for LeetCode integration with:
 * - Status indicator (Auto ✅ | Manual ⌨️ | Failed ❌)
 * - Auto-detection toggle
 * - Username configuration
 * - Graceful fallback to manual input
 */

class LeetCodePanel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.mode = 'manual'; // auto, manual, failed
        this.autoDetectEnabled = false;
        this.username = '';
        this.problemsDetected = 0;

        this.init();
    }

    async init() {
        await this.loadSettings();
        this.render();
        this.attachEventListeners();
    }

    async loadSettings() {
        try {
            const response = await fetch('/api/leetcode/settings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.username = data.leetcodeUsername || '';
                this.autoDetectEnabled = data.leetcodeAutoDetect || false;
            }
        } catch (error) {
            console.error('Failed to load LeetCode settings:', error);
        }
    }

    render() {
        const statusIcons = {
            auto: '✅ Auto',
            manual: '⌨️ Manual',
            failed: '❌ Failed'
        };

        const statusColors = {
            auto: '#4ade80',
            manual: '#60a5fa',
            failed: '#f87171'
        };

        this.container.innerHTML = `
      <div class="leetcode-panel">
        <div class="leetcode-header">
          <h3>🧠 LeetCode Problem</h3>
          <span class="leetcode-status" style="color: ${statusColors[this.mode]}">
            ${statusIcons[this.mode]}
          </span>
        </div>

        ${this.renderModeContent()}

        <div class="leetcode-settings-toggle">
          <button id="leetcode-settings-btn" class="btn-secondary btn-sm">
            ⚙️ Configure Auto-Detection
          </button>
        </div>
      </div>

      <!-- Settings Modal -->
      <div id="leetcode-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>LeetCode Auto-Detection Settings</h3>
            <button class="modal-close" id="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="leetcode-username">LeetCode Username</label>
              <input 
                type="text" 
                id="leetcode-username" 
                value="${this.username}"
                placeholder="Enter your LeetCode username"
                class="form-input"
              />
              <small>Your LeetCode profile must be public for auto-detection to work.</small>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  id="leetcode-auto-detect"
                  ${this.autoDetectEnabled ? 'checked' : ''}
                />
                Enable Auto-Detection
              </label>
              <small>Automatically detect new problems solved (requires valid username)</small>
            </div>

            <div id="validate-status" class="status-message"></div>

            <div class="modal-actions">
              <button id="validate-username-btn" class="btn-secondary">
                Validate Username
              </button>
              <button id="save-settings-btn" class="btn-primary">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    renderModeContent() {
        if (this.mode === 'auto' && this.problemsDetected > 0) {
            return `
        <div class="leetcode-auto-result">
          <p class="success-message">
            🎉 Detected ${this.problemsDetected} problem(s) solved today!
          </p>
          <p class="hint">Task will be marked complete automatically.</p>
        </div>
      `;
        }

        if (this.mode === 'failed') {
            return `
        <div class="leetcode-failed-result">
          <p class="error-message">
            ⚠️ Auto-detection failed. Please enter manually below.
          </p>
        </div>
      `;
        }

        return `
      <div class="leetcode-manual-input">
        <label for="leetcode-problems">Problems Completed Today</label>
        <input 
          type="number" 
          id="leetcode-problems" 
          min="0" 
          value="0"
          class="form-input"
        />
        <small>Enter 1 to unlock base reward, more for bonus episodes</small>
      </div>
    `;
    }

    attachEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('leetcode-settings-btn');
        settingsBtn?.addEventListener('click', () => this.openSettings());

        // Modal close
        const modalClose = document.getElementById('modal-close');
        modalClose?.addEventListener('click', () => this.closeSettings());

        // Validate username
        const validateBtn = document.getElementById('validate-username-btn');
        validateBtn?.addEventListener('click', () => this.validateUsername());

        // Save settings
        const saveBtn = document.getElementById('save-settings-btn');
        saveBtn?.addEventListener('click', () => this.saveSettings());

        // Close modal on background click
        const modal = document.getElementById('leetcode-modal');
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSettings();
            }
        });
    }

    async checkAutoDetection() {
        if (!this.autoDetectEnabled || !this.username) {
            this.mode = 'manual';
            this.problemsDetected = 0;
            return { mode: 'manual', completed: 0 };
        }

        try {
            const response = await fetch('/api/leetcode/check', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            this.mode = data.mode;
            this.problemsDetected = data.completed;

            return data;
        } catch (error) {
            console.error('Auto-detection error:', error);
            this.mode = 'failed';
            this.problemsDetected = 0;
            return { mode: 'failed', completed: 0 };
        }
    }

    async validateUsername() {
        const usernameInput = document.getElementById('leetcode-username');
        const username = usernameInput.value.trim();
        const statusDiv = document.getElementById('validate-status');

        if (!username) {
            statusDiv.innerHTML = '<p class="error-message">Please enter a username</p>';
            return;
        }

        statusDiv.innerHTML = '<p class="info-message">Validating...</p>';

        try {
            const response = await fetch('/api/leetcode/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (data.valid) {
                statusDiv.innerHTML = `<p class="success-message">${data.message}</p>`;
            } else {
                statusDiv.innerHTML = `<p class="error-message">${data.message}</p>`;
            }
        } catch (error) {
            statusDiv.innerHTML = '<p class="error-message">Validation failed. Please try again.</p>';
        }
    }

    async saveSettings() {
        const usernameInput = document.getElementById('leetcode-username');
        const autoDetectCheckbox = document.getElementById('leetcode-auto-detect');
        const statusDiv = document.getElementById('validate-status');

        const username = usernameInput.value.trim();
        const autoDetect = autoDetectCheckbox.checked;

        try {
            const response = await fetch('/api/leetcode/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    leetcodeUsername: username,
                    leetcodeAutoDetect: autoDetect
                })
            });

            const data = await response.json();

            if (data.success) {
                this.username = username;
                this.autoDetectEnabled = autoDetect;
                statusDiv.innerHTML = '<p class="success-message">✅ Settings saved successfully!</p>';

                setTimeout(() => {
                    this.closeSettings();
                    this.render();
                    this.attachEventListeners();
                }, 1500);
            } else {
                statusDiv.innerHTML = '<p class="error-message">Failed to save settings</p>';
            }
        } catch (error) {
            statusDiv.innerHTML = '<p class="error-message">Error saving settings. Please try again.</p>';
        }
    }

    openSettings() {
        const modal = document.getElementById('leetcode-modal');
        modal.style.display = 'flex';
    }

    closeSettings() {
        const modal = document.getElementById('leetcode-modal');
        modal.style.display = 'none';
    }

    getManualInput() {
        const input = document.getElementById('leetcode-problems');
        return input ? parseInt(input.value) || 0 : 0;
    }

    async getProblemsCompleted() {
        if (this.autoDetectEnabled && this.username) {
            const result = await this.checkAutoDetection();
            this.render();
            this.attachEventListeners();
            return result.completed;
        } else {
            return this.getManualInput();
        }
    }
}

// Export for use in dashboard
window.LeetCodePanel = LeetCodePanel;
