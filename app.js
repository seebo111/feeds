// Feed URL from Nitter
const feedUrl = 'https://nitter.poast.org/i/lists/1913413447737647534/rss';

async function fetchFeed() {
  try {
    // Use fetch API to get feed data
    const res = await fetch(`https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(feedUrl)}`);
    const data = await res.json();
    
    if (data && data.items) {
      const feedList = document.getElementById('feed-list');
      data.items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong><a href="${item.link}" target="_blank">${item.title}</a></strong>
          <p>${item.description}</p>
          <small>Posted on: ${new Date(item.pubDate).toLocaleString()}</small>
        `;
        feedList.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error fetching the feed:", error);
  }
}

// Fetch the feed when the page loads
fetchFeed();

// Optionally, update the feed every 10 minutes
setInterval(fetchFeed, 600000);
