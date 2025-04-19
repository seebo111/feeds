// Replace with your Nitter RSS URL
const RSS_URL = "https://nitter.poast.org/i/lists/1913413447737647534/rss";

// Fetch RSS feed and display tweets
async function fetchTweets() {
  try {
    // Use a proxy to avoid CORS issues (example: https://corsproxy.io/)
    const proxy = "https://api.corsproxy.io/?url=";
    const response = await fetch(proxy + encodeURIComponent(RSS_URL));
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");

    // Parse XML data
    const items = xmlDoc.querySelectorAll("item");
    const tweetsContainer = document.getElementById("tweets");
    tweetsContainer.innerHTML = ""; // Clear previous content

    items.forEach(item => {
      const title = item.querySelector("title").textContent;
      const link = item.querySelector("link").textContent;
      const description = item.querySelector("description").textContent;
      const pubDate = item.querySelector("pubDate").textContent;

      // Create tweet HTML element
      const tweetDiv = document.createElement("div");
      tweetDiv.className = "tweet";
      tweetDiv.innerHTML = `
        <p class="tweet-content">${description}</p>
        <div class="tweet-footer">
          <a href="${link}" target="_blank" class="tweet-link">View Tweet</a>
          <span class="tweet-date">${pubDate}</span>
        </div>
      `;

      tweetsContainer.appendChild(tweetDiv);
    });
  } catch (error) {
    console.error("Error fetching tweets:", error);
  }
}

// Initial fetch
fetchTweets();

// Refresh every 5 minutes (optional)
setInterval(fetchTweets, 300000);
