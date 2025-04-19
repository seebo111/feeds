document.addEventListener("DOMContentLoaded", async () => {
  const RSS_URL = "https://nitter.poast.org/i/lists/1913413447737647534/rss";
  const tweetsContainer = document.getElementById("tweets");

  if (!tweetsContainer) {
    console.error("Error: #tweets element not found!");
    return;
  }

  async function fetchTweets() {
    try {
      const proxy = "https://cors-anywhere.herokuapp.com/";
      const response = await fetch(proxy + RSS_URL, {
        headers: { "X-Requested-With": "XMLHttpRequest" } // Required for some proxies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");

      // Clear previous tweets
      tweetsContainer.innerHTML = "";

      const items = xmlDoc.querySelectorAll("item");
      if (items.length === 0) {
        tweetsContainer.innerHTML = "<p>No tweets found.</p>";
        return;
      }

      items.forEach((item) => {
        const title = item.querySelector("title").textContent;
        const link = item.querySelector("link").textContent;
        const description = item.querySelector("description").textContent;
        const pubDate = item.querySelector("pubDate").textContent;

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
      tweetsContainer.innerHTML = `<p class="error">Failed to load tweets. Try again later.</p>`;
    }
  }

  fetchTweets();
  setInterval(fetchTweets, 300000); // Refresh every 5 minutes
});
