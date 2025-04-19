const rssUrl = "https://nitter.net/i/lists/1913413447737647534/rss";
const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`;
const feedContainer = document.getElementById("feed");

fetch(proxyUrl)
  .then(response => response.text())
  .then(xmlText => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "application/xml");
    const items = xml.querySelectorAll("item");

    if (!items.length) {
      feedContainer.innerHTML = "<li>No tweets found.</li>";
      return;
    }

    items.forEach(item => {
      const title = item.querySelector("title").textContent;
      const link = item.querySelector("link").textContent;
      const pubDate = item.querySelector("pubDate").textContent;

      const li = document.createElement("li");
      li.innerHTML = `<a href="${link}" target="_blank">${title}</a><br><small>${pubDate}</small>`;
      feedContainer.appendChild(li);
    });
  })
  .catch(error => {
    console.error("Error fetching the feed:", error);
    feedContainer.innerHTML = `<li>⚠️ Failed to fetch tweets.</li>`;
  });
