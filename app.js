const rssUrl = "https://nitter.poast.org/i/lists/1913413447737647534/rss";
const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`;
const feedContainer = document.getElementById("feed");

fetch(proxyUrl)
  .then(res => res.text())
  .then(str => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(str, "application/xml");
    const items = xml.querySelectorAll("item");

    feedContainer.innerHTML = "";

    if (!items.length) {
      feedContainer.innerHTML = "<li>No tweets found.</li>";
      return;
    }

    items.forEach(item => {
      const title = item.querySelector("title")?.textContent || "";
      const link = item.querySelector("link")?.textContent || "#";
      const pubDate = item.querySelector("pubDate")?.textContent || "";

      const li = document.createElement("li");
      li.innerHTML = `<a href="${link}" target="_blank">${title}</a><br><small>${pubDate}</small>`;
      feedContainer.appendChild(li);
    });
  })
  .catch(error => {
    console.error("Error fetching feed:", error);
    feedContainer.innerHTML = `<li>⚠️ Failed to fetch tweets.</li>`;
  });
