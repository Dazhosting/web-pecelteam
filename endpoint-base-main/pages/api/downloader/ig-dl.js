// File: pages/api/evoig.js

import axios from 'axios';
import * as cheerio from 'cheerio';

async function getSecurityToken() {
  const { data: html } = await axios.get('https://evoig.com/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const $ = cheerio.load(html);
  const token =
    $('script:contains("ajax_var")').html()?.match(/"security"\s*:\s*"([a-z0-9]{10,})"/i)?.[1] ||
    html.match(/"security"\s*:\s*"([a-z0-9]{10,})"/i)?.[1] ||
    null;

  if (!token) throw new Error('Token keamanan tidak ditemukan.');
  return token;
}

async function evoig(url) {
  if (!url || !url.includes('instagram.com')) {
    throw new Error('URL Instagram tidak valid.');
  }

  const token = await getSecurityToken();
  const form = new URLSearchParams();
  form.append('action', 'ig_download');
  form.append('security', token);
  form.append('ig_url', url);

  const { data } = await axios.post('https://evoig.com/wp-admin/admin-ajax.php', form, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'origin': 'https://evoig.com',
      'referer': 'https://evoig.com/',
      'user-agent': 'Mozilla/5.0',
      'x-requested-with': 'XMLHttpRequest'
    }
  });

  const result = data?.data?.data?.[0];
  if (!result || !result.link) {
    throw new Error('Link unduhan tidak ditemukan.');
  }

  return {
    status: true,
    type: result.type,
    thumb: result.thumb,
    url: result.link
  };
}

// Handler Next.js API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Gunakan metode GET.' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      creator: "Zypher",
      error: 'Masukkan parameter ?url=https://www.instagram.com/...'
    });
  }

  try {
    const result = await evoig(url);
    return res.status(200).json({
      creator: "Zypher",
      data: result
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
  
