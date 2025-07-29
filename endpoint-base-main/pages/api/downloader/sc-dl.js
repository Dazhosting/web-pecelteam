// File: pages/api/scdl.js

import axios from 'axios';
import * as cheerio from 'cheerio';
import FormData from 'form-data'; // 1. Impor pustaka FormData

// --- Konfigurasi dan Konstanta ---
const CREATOR = "Zypher";
const TARGET_URL = 'https://soundcloudmp3.co/result.php';
const BASE_URL = 'https://soundcloudmp3.co';

export default async function handler(req, res) {
  // --- Pemeriksaan Metode Request ---
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      creator: CREATOR,
      message: 'Metode tidak diizinkan, silakan gunakan GET.'
    });
  }

  // --- Validasi Input ---
  const { url } = req.query;
  if (!url || !url.includes('soundcloud.com')) {
    return res.status(400).json({
      success: false,
      creator: CREATOR,
      message: 'Parameter "url" SoundCloud tidak valid atau tidak ada.'
    });
  }

  try {
    // 2. Gunakan FormData untuk membuat payload, ini lebih aman dan bersih
    const form = new FormData();
    form.append('url', url);

    // --- Melakukan Request ke Server Target ---
    // Axios akan secara otomatis mengatur 'Content-Type' dengan boundary yang benar
    const { data: htmlResponse } = await axios.post(TARGET_URL, form, {
      headers: {
        ...form.getHeaders(), // Header penting dari FormData
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Referer': `${BASE_URL}/pt`,
        'Origin': BASE_URL,
      },
    });

    // --- Parsing dan Ekstraksi Data (Scraping) ---
    const $ = cheerio.load(htmlResponse);

    const title = $('.text-2xl').text().trim();
    const audiourl = $('audio > source').attr('src');
    const dhref = $('a.chbtn').attr('href');
    
    // Jika scraping gagal, kembalikan error yang sesuai
    if (!title || !audiourl || !dhref) {
      // 3. Gunakan status 502 Bad Gateway, karena masalah ada di server target
      return res.status(502).json({
        success: false,
        creator: CREATOR,
        message: 'Gagal mengekstrak data dari server target. Mungkin struktur situs web mereka telah berubah.'
      });
    }
    
    // Membangun URL download absolut
    const durl = dhref.startsWith('http') ? dhref : `${BASE_URL}${decodeURIComponent(dhref)}`;

    // --- Mengirim Respons Sukses ---
    // 4. Struktur respons yang konsisten dan informatif
    return res.status(200).json({
      success: true,
      creator: CREATOR,
      message: 'Data berhasil diambil.',
      data: {
        title,
        audiourl,
        durl,
      },
    });

  } catch (error) {
    // --- Penanganan Error Umum ---
    console.error('SCDL API Error:', error); // Log error untuk debugging di server

    // Cek jika error berasal dari axios
    if (error.response) {
      // Error dari server target (misalnya 404, 503, dll)
      return res.status(502).json({
        success: false,
        creator: CREATOR,
        message: `Server target merespons dengan error: ${error.response.status}`,
      });
    }

    return res.status(500).json({
      success: false,
      creator: CREATOR,
      message: error.message || 'Terjadi kesalahan internal pada server.',
    });
  }
              }
