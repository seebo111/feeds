// RSS URL of your Twitter List
const rssUrl = "https://nitter.poast.org/i/lists/1913413447737647534/rss";

// Proxy URL to avoid CORS issues
const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(rssUrl);

fetch(proxyUrl)
  .then(res => res.json()) // Use .json() for AllOrigins response
  .then(data => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "application/xml");
    const items = xml.querySelectorAll("item");

    const tweetsContainer = document.getElementById("tweets-container");
    tweetsContainer.innerHTML = ""; // Clear the "Loading Tweets..." text

    if (items.length === 0) {
      tweetsContainer.innerHTML = "<p>No tweets found</p>";
      return;
    }

    items.forEach(item => {
      const title = item.querySelector("title").textContent;
      const description = item.querySelector("description").textContent;
      const link = item.querySelector("link").textContent;

      // Create HTML elements dynamically for each tweet
      const tweetElement = document.createElement("div");
      tweetElement.classList.add("tweet");

      tweetElement.innerHTML = `
        <h3><a href="${link}" target="_blank">${title}</a></h3>
        <p>${description}</p>
      `;

      tweetsContainer.appendChild(tweetElement);
    });
  })
  .catch(error => {
    console.error("Error fetching the feed:", error);
    document.getElementById("tweets-container").innerHTML = "<p>Failed to load tweets.</p>";
  });
