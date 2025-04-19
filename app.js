document.addEventListener("DOMContentLoaded", () => {
    // Configuration
    const CONFIG = {
        nitterInstances: [
            "https://nitter.net",
            "https://nitter.poast.org",
            "https://nitter.it"
        ],
        listId: "1913413447737647534",
        refreshInterval: 30000, // 30 seconds
        maxRetries: 3
    };

    // DOM Elements
    const tweetsContainer = document.getElementById("tweets");
    let currentInstanceIndex = 0;
    let refreshTimer = null;

    // Main function to fetch tweets
    const fetchTweets = async () => {
        clearTimeout(refreshTimer); // Clear previous timer
        tweetsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading tweets...</div>';

        try {
            const instance = CONFIG.nitterInstances[currentInstanceIndex];
            const rssUrl = `${instance}/i/lists/${CONFIG.listId}/rss`;
            
            // Using CORS proxy
            const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(rssUrl)}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            const items = xmlDoc.querySelectorAll("item");

            renderTweets(items);
            currentInstanceIndex = 0; // Reset to primary instance on success

        } catch (error) {
            console.error("Fetch error:", error);
            handleFetchError(error);
        } finally {
            // Schedule next refresh
            refreshTimer = setTimeout(fetchTweets, CONFIG.refreshInterval);
        }
    };

    // Render tweets to the DOM
    const renderTweets = (items) => {
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
    };

    // Handle fetch errors
    const handleFetchError = (error) => {
        currentInstanceIndex = (currentInstanceIndex + 1) % CONFIG.nitterInstances.length;
        
        if (currentInstanceIndex === 0) {
            tweetsContainer.innerHTML = `
                <div class="error">
                    <p>Failed to load tweets after trying all servers</p>
                    <button onclick="location.reload()">Try Again</button>
                </div>
            `;
        } else {
            tweetsContainer.innerHTML = `
                <div class="loading">
                    Trying alternate server (${currentInstanceIndex + 1}/${CONFIG.nitterInstances.length})...
                </div>
            `;
        }
    };

    // Helper functions
    const extractImageUrl = (html) => {
        const imgMatch = html.match(/<img[^>]+src="([^">]+)"/i);
        return imgMatch ? imgMatch[1] : null;
    };

    const cleanText = (html) => {
        return html.replace(/<img[^>]*>/g, "")
                  .replace(/<[^>]+>/g, "")
                  .replace(/\s+/g, ' ')
                  .trim();
    };

    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    // Initial load
    fetchTweets();
});
