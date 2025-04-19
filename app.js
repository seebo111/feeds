const rssUrl = "https://nitter.poast.org/i/lists/1913413447737647534/rss";
const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

const feedContainer = document.getElementById("feed");

fetch(proxyUrl)
  .then(response => {
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  })
  .then(data => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "application/xml");
    const items = xml.querySelectorAll("item");

    if (items.length === 0) {
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
    console.error("Error fetching feed:", error);
    feedContainer.innerHTML = `<li>⚠️ Failed to fetch tweets.</li>`;
  });
