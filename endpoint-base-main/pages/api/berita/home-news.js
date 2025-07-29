import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE = 'https://example.com'; // Ganti dengan URL asli

export default async function handler(req, res) {
  try {
    const { data } = await axios.get(BASE);
    const $ = cheerio.load(data);
    const articles = [];

    $('.articles--iridescent-list--text-item').each((_, el) => {
      const title = $(el).find('.articles--iridescent-list--text-item__title-link').text().trim();
      const link = $(el).find('.articles--iridescent-list--text-item__title-link').attr('href');
      const thumb = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
      const summary = $(el).find('.articles--iridescent-list--text-item__summary').text().trim();

      if (title && link) {
        articles.push({
          title,
          link: link.startsWith('http') ? link : BASE + link,
          thumb,
          summary,
        });
      }
    });

    res.status(200).json({
      creator: "Zypher",
      articles
    });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Gagal mengambil data', error: err.message });
  }
}
