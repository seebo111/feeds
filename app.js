document.addEventListener("DOMContentLoaded", () => {
  // Configuration
  const CONFIG = {
    nitterInstances: [
      "https://nitter.net",
      "https://nitter.poast.org",
      "https://nitter.it"
    ],
    listId: "1913413447737647534",
    retryDelay: 5000, // 5 seconds between retries
    maxRetries: 3
  };

  // DOM Elements
  const tweetsContainer = document.getElementById("tweets");
  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "loading";
  loadingIndicator.innerHTML = "Loading tweets...";

  // State
  let currentRetry = 0;
  let currentInstanceIndex = 0;

  // Main function
  async function fetchTweets() {
    if (!tweetsContainer) {
      console.error("Error: #tweets element not found!");
      return;
    }

    // Show loading state
    tweetsContainer.innerHTML = "";
    tweetsContainer.appendChild(loadingIndicator);

    try {
      const currentInstance = CONFIG.nitterInstances[currentInstanceIndex];
      const rssUrl = `${currentInstance}/i/lists/${CONFIG.listId}/rss`;
      
      const response = await fetch(rssUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/rss+xml'
        }
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const text = await response.text();
      if (!text.includes("<rss")) throw new Error("Invalid RSS data");

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      const items = xmlDoc.querySelectorAll("item");

      if (items.length === 0) {
        showMessage("No tweets found in this list.");
        return;
      }

      renderTweets(items);
      currentRetry = 0; // Reset retry counter on success

    } catch (error) {
      console.error("Fetch error:", error);
      handleFetchError(error);
    }
  }

  // Render tweets to DOM
  function renderTweets(items) {
    tweetsContainer.innerHTML = "";

    items.forEach((item) => {
      try {
        const title = item.querySelector("title")?.textContent || "No title";
        const link = item.querySelector("link")?.textContent || "#";
        const description = item.querySelector("description")?.textContent || "";
        const pubDate = item.querySelector("pubDate")?.textContent || "";

        const tweetDiv = document.createElement("div");
        tweetDiv.className = "tweet";
        tweetDiv.innerHTML = `
          <p class="tweet-content">${description}</p>
          <div class="tweet-footer">
            <a href="${link}" target="_blank" rel="noopener" class="tweet-link">View Tweet</a>
            <span class="tweet-date">${formatDate(pubDate)}</span>
          </div>
        `;
        tweetsContainer.appendChild(tweetDiv);
      } catch (e) {
        console.error("Error rendering tweet:", e);
      }
    });
  }

  // Error handling with retries
  function handleFetchError(error) {
    currentRetry++;
    
    if (currentRetry <= CONFIG.maxRetries) {
      showMessage(`Attempt ${currentRetry} of ${CONFIG.maxRetries}. Retrying...`);
      setTimeout(fetchTweets, CONFIG.retryDelay);
    } else {
      // Try next Nitter instance
      currentInstanceIndex = (currentInstanceIndex + 1) % CONFIG.nitterInstances.length;
      currentRetry = 0;
      
      if (currentInstanceIndex === 0) {
        showMessage("All instances failed. Please try again later.");
      } else {
        showMessage(`Trying alternate server...`);
        setTimeout(fetchTweets, CONFIG.retryDelay);
      }
    }
  }

  // Helper functions
  function showMessage(text) {
    tweetsContainer.innerHTML = `<p class="message">${text}</p>`;
  }

  function formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

  // Initialize
  fetchTweets();

  // Auto-refresh (every 5 minutes)
  setInterval(fetchTweets, 300000);
});
