const feedUrl = "https://nitter.poast.org/i/lists/1913413447737647534/rss";
const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

const feedContainer = document.getElementById("feed");

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    if (!data.items || data.items.length === 0) {
      feedContainer.innerHTML = "<li>No tweets found.</li>";
      return;
    }
    data.items.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a><br><small>${item.pubDate}</small>`;
      feedContainer.appendChild(li);
    });
  })
  .catch(error => {
    feedContainer.innerHTML = `<li>Error fetching the feed: ${error}</li>`;
  });
