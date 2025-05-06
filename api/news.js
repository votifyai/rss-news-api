import fetch from 'node-fetch';
globalThis.fetch = fetch;

import Parser from 'rss-parser';

const parser = new Parser();

export default async function handler(req, res) {
  try {
    const feeds = await Promise.all([
      parser.parseURL('https://feeds.npr.org/1001/rss.xml'),
      parser.parseURL('https://www.npr.org/rss/rss.php?id=1014'),
      parser.parseURL('https://apnews.com/rss')
    ]);

    const allArticles = feeds.flatMap(feed =>
      feed.items.map(item => ({
        title: item.title || '',
        link: item.link || '',
        summary: item.contentSnippet || '',
        pubDate: item.pubDate || '',
        source: feed.title || 'Unknown',
      }))
    );

    const uniqueArticles = allArticles.filter(
      (item, index, self) =>
        index === self.findIndex(a => a.title === item.title)
    );

    uniqueArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    res.status(200).json(uniqueArticles);
  } catch (error) {
    console.error('RSS fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
}

