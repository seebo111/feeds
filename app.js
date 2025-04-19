document.addEventListener("DOMContentLoaded", () => {
    // Configuration
    const CONFIG = {
        instances: [
            "https://nitter.net",
            "https://nitter.it",
            "https://nitter.unixfox.eu",
            "https://nitter.poast.org"
        ],
        listId: "1913413447737647534",
        refreshInterval: 30000, // 30 seconds
        maxRetries: 2
    };

    // DOM Elements
    const tweetsContainer = document.getElementById("tweets");
    const refreshButton = document.getElementById("refresh-button");
    const statusElement = document.getElementById("connection-status");
    let currentInstanceIndex = 0;
    let retryCount = 0;
    let refreshTimer = null;

    // Update connection status UI
    function updateStatus(message, type = "info") {
        statusElement.innerHTML = `<i class="fas fa-${type === "error" ? "exclamation-circle" : type === "success" ? "check-circle" : "circle-notch fa-spin"}"></i> ${message}`;
        statusElement.className = type;
    }

    // Main fetch function
    async function fetchTweets() {
        clearTimeout(refreshTimer);
        tweetsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading tweets...</div>';

        const currentInstance = CONFIG.instances[currentInstanceIndex];
        updateStatus(`Connecting to ${new URL(currentInstance).hostname}...`);

        try {
            // Try direct fetch first
            let response = await fetchWithTimeout(`${currentInstance}/i/lists/${CONFIG.listId}/rss`, {
                timeout: 5000
            });

            // If direct fetch fails, try with proxy
            if (!response.ok) {
                response = await fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(`${currentInstance}/i/lists/${CONFIG.listId}/rss`)}`, {
                    timeout: 5000
                });
            }

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const text = await response.text();
            if (!text.includes("<rss")) throw new Error("Invalid RSS data");

            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            const items = xml.querySelectorAll("item");

            renderTweets(items);
            updateStatus(`Connected to ${new URL(currentInstance).hostname}`, "success");
            retryCount = 0;

        } catch (error) {
            console.error(`Error (${currentInstance}):`, error);
            retryCount++;
            
            if (retryCount >= CONFIG.maxRetries) {
                currentInstanceIndex = (currentInstanceIndex + 1) % CONFIG.instances.length;
                retryCount = 0;
            }

            if (currentInstanceIndex === 0 && retryCount === 0) {
                updateStatus("All servers failed. Trying again...", "error");
                tweetsContainer.innerHTML = `
                    <div class="error">
                        <p>Failed to connect to all servers</p>
                        <button onclick="location.reload()">Retry</button>
                    </div>
                `;
            } else {
                updateStatus(`Retrying (${retryCount}/${CONFIG.maxRetries})...`, "error");
                fetchTweets(); // Immediate retry
                return;
            }
        }

        refreshTimer = setTimeout(fetchTweets, CONFIG.refreshInterval);
    }

    // Helper function to fetch with timeout
    async function fetchWithTimeout(url, options = {}) {
        const { timeout = 8000 } = options;
        
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(id);
        return response;
    }

    // Render tweets to DOM
    function renderTweets(items) {
        if (items.length === 0) {
            tweetsContainer.innerHTML = '<div class="empty">No tweets found in this list.</div>';
            return;
        }

        tweetsContainer.innerHTML = '';

        items.forEach(item => {
            const description = item.querySelector("description")?.textContent || "";
            const pubDate = item.querySelector("pubDate")?.textContent || "";
            const link = item.querySelector("link")?.textContent || "#";
            const imageUrl = extractImageUrl(description);
            const tweetText = cleanText(description);

            const tweetElement = document.createElement("div");
            tweetElement.className = "tweet";
            tweetElement.innerHTML = `
                <img src="https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png" class="tweet-avatar">
                <div class="tweet-content">
                    <div class="tweet-header">
                        <span class="tweet-name">List Member</span>
                        <span class="tweet-username">@user</span>
                        <span class="tweet-time">• ${formatTime(pubDate)}</span>
                    </div>
                    <div class="tweet-text">${tweetText}</div>
                    ${imageUrl ? `<img src="${imageUrl}" class="tweet-image" loading="lazy">` : ''}
                    <div class="tweet-actions">
                        <div class="tweet-action"><i class="far fa-comment"></i></div>
                        <div class="tweet-action"><i class="fas fa-retweet"></i></div>
                        <div class="tweet-action"><i class="far fa-heart"></i></div>
                        <div class="tweet-action"><i class="fas fa-share"></i></div>
                    </div>
                </div>
            `;
            tweetsContainer.appendChild(tweetElement);
        });
    }

    // Helper functions
    function extractImageUrl(html) {
        const imgMatch = html.match(/<img[^>]+src="([^">]+)"/i);
        return imgMatch ? imgMatch[1] : null;
    }

    function cleanText(html) {
        return html.replace(/<img[^>]*>/g, "")
                  .replace(/<[^>]+>/g, "")
                  .replace(/\s+/g, ' ')
                  .trim();
    }

    function formatTime(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    }

    // Event listeners
    refreshButton.addEventListener("click", () => {
        clearTimeout(refreshTimer);
        fetchTweets();
    });

    // Initial load
    fetchTweets();
});
