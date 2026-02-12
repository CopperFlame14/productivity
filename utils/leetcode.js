/**
 * LeetCode Auto-Detection Utility
 * 
 * Attempts to fetch LeetCode problem count from public profile
 * with graceful fallback to manual mode if API fails.
 * 
 * Design Notes:
 * - Uses unofficial LeetCode GraphQL API
 * - Stores previous count to detect new completions
 * - Returns status: 'auto', 'manual', 'failed'
 * - Easy to update API logic without breaking system
 */

const https = require('https');

/**
 * Fetch LeetCode problem count from public profile
 * @param {string} username - LeetCode username
 * @returns {Promise<{success: boolean, count: number|null, error: string|null}>}
 */
async function fetchLeetCodeStats(username) {
  if (!username || username.trim() === '') {
    return {
      success: false,
      count: null,
      error: 'Username not provided'
    };
  }

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const variables = { username: username.trim() };

  const postData = JSON.stringify({
    query,
    variables
  });

  const options = {
    hostname: 'leetcode.com',
    path: '/graphql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 5000 // 5 second timeout
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.errors) {
            resolve({
              success: false,
              count: null,
              error: 'LeetCode API returned errors'
            });
            return;
          }

          if (!response.data || !response.data.matchedUser) {
            resolve({
              success: false,
              count: null,
              error: 'User not found or profile is private'
            });
            return;
          }

          const submissions = response.data.matchedUser.submitStats.acSubmissionNum;
          const totalCount = submissions.find(item => item.difficulty === 'All')?.count || 0;

          resolve({
            success: true,
            count: totalCount,
            error: null
          });
        } catch (error) {
          resolve({
            success: false,
            count: null,
            error: 'Failed to parse LeetCode response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        count: null,
        error: `Network error: ${error.message}`
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        count: null,
        error: 'Request timeout - LeetCode API not responding'
      });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Check if user completed new problems
 * @param {string} username - LeetCode username
 * @param {number} previousCount - Previously stored count
 * @returns {Promise<{mode: string, completed: number, newCount: number|null, message: string}>}
 */
async function checkLeetCodeCompletion(username, previousCount = 0) {
  // If no username configured, use manual mode
  if (!username || username.trim() === '') {
    return {
      mode: 'manual',
      completed: 0,
      newCount: null,
      message: 'LeetCode username not configured. Using manual input.'
    };
  }

  try {
    const result = await fetchLeetCodeStats(username);

    if (!result.success) {
      // API failed - gracefully fallback to manual
      return {
        mode: 'failed',
        completed: 0,
        newCount: null,
        message: `Auto-detection failed: ${result.error}. Please use manual input.`
      };
    }

    const newCount = result.count;
    const problemsSolved = Math.max(0, newCount - previousCount);

    return {
      mode: 'auto',
      completed: problemsSolved,
      newCount: newCount,
      message: problemsSolved > 0 
        ? `✅ Detected ${problemsSolved} new problem(s) solved!`
        : 'No new problems detected today.'
    };
  } catch (error) {
    // Unexpected error - fallback to manual
    return {
      mode: 'failed',
      completed: 0,
      newCount: null,
      message: `Unexpected error: ${error.message}. Please use manual input.`
    };
  }
}

/**
 * Validate LeetCode username
 * @param {string} username
 * @returns {Promise<{valid: boolean, message: string}>}
 */
async function validateLeetCodeUsername(username) {
  const result = await fetchLeetCodeStats(username);
  
  return {
    valid: result.success,
    message: result.success 
      ? `✅ LeetCode username '${username}' verified! Total problems: ${result.count}`
      : `❌ ${result.error}`
  };
}

module.exports = {
  fetchLeetCodeStats,
  checkLeetCodeCompletion,
  validateLeetCodeUsername
};
